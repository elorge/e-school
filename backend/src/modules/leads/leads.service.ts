// backend/src/modules/leads/leads.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LeadActivityKind, LeadStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface CaptureLead {
  kind: 'CHAT_STARTED' | 'DEMO_REQUESTED' | 'SIGNUP_REQUESTED';
  name: string;
  email?: string | null;
  phone?: string | null;
  countryCode?: string | null;
  schoolName?: string | null;
  chatId?: string | null;
  text: string;
}

const clean = (v?: string | null) => (v && v.trim() ? v.trim() : null);

/**
 * One lead per person. Chats, demo requests and signup requests that share an
 * email land on the same lead; anything without an email gets its own.
 */
@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Records an enquiry. Never throws — a CRM hiccup must not break chat, signup or a demo request. */
  async capture(p: CaptureLead): Promise<void> {
    try {
      const email = clean(p.email)?.toLowerCase() ?? null;
      const existing = email ? await this.prisma.lead.findUnique({ where: { email } }) : null;
      if (existing) {
        await this.touch(existing.id, existing.status, p, existing);
        return;
      }
      try {
        await this.prisma.lead.create({
          data: {
            name: p.name, email, phone: clean(p.phone), countryCode: clean(p.countryCode),
            schoolName: clean(p.schoolName), chatId: p.chatId ?? null,
            activities: { create: { kind: p.kind, text: p.text.slice(0, 1000) } },
          },
        });
      } catch (e) {
        // Two enquiries from the same email at the same instant: the second one joins the first.
        if ((e as Prisma.PrismaClientKnownRequestError).code !== 'P2002' || !email) throw e;
        const winner = await this.prisma.lead.findUnique({ where: { email } });
        if (winner) await this.touch(winner.id, winner.status, p, winner);
      }
    } catch (err) {
      this.logger.error(`lead capture failed: ${err}`);
    }
  }

  private async touch(
    id: string, status: LeadStatus, p: CaptureLead,
    cur: { phone: string | null; countryCode: string | null; schoolName: string | null },
  ) {
    await this.prisma.lead.update({
      where: { id },
      data: {
        // Fill gaps, never overwrite what we already know.
        phone: cur.phone ?? clean(p.phone), countryCode: cur.countryCode ?? clean(p.countryCode),
        schoolName: cur.schoolName ?? clean(p.schoolName),
        ...(p.chatId ? { chatId: p.chatId } : {}),
        lastActivityAt: new Date(),
        ...(status === 'LOST' ? { status: 'NEW' as const } : {}), // they came back
        activities: { create: { kind: p.kind, text: p.text.slice(0, 1000) } },
      },
    });
  }

  /** Called when a school's signup request is approved. */
  async markSignedUp(p: { email: string; name: string; schoolName: string; phone?: string | null; countryCode?: string | null }): Promise<void> {
    try {
      const email = p.email.trim().toLowerCase();
      const text = `School approved: ${p.schoolName}`;
      const lead = await this.prisma.lead.findUnique({ where: { email } });
      if (lead) {
        await this.prisma.lead.update({
          where: { id: lead.id },
          data: { status: 'SIGNED_UP', lastActivityAt: new Date(), activities: { create: { kind: 'STATUS_CHANGED', text } } },
        });
      } else {
        await this.prisma.lead.create({
          data: {
            name: p.name, email, phone: clean(p.phone), countryCode: clean(p.countryCode), schoolName: p.schoolName, status: 'SIGNED_UP',
            activities: { create: { kind: 'STATUS_CHANGED', text } },
          },
        });
      }
    } catch (err) {
      this.logger.error(`markSignedUp failed: ${err}`);
    }
  }

  // ───────────── admin ─────────────

  async list(status?: string, q?: string) {
    const search = q?.trim().slice(0, 80);
    const where: Prisma.LeadWhereInput = {
      ...(isStatus(status) ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
              { schoolName: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [rows, grouped] = await Promise.all([
      this.prisma.lead.findMany({
        where, orderBy: { lastActivityAt: 'desc' }, take: 200,
        include: { activities: { orderBy: { createdAt: 'desc' }, take: 1 } },
      }),
      this.prisma.lead.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);
    const counts: Record<string, number> = { NEW: 0, CONTACTED: 0, DEMO_BOOKED: 0, SIGNED_UP: 0, LOST: 0 };
    for (const g of grouped) counts[g.status] = g._count._all;
    return {
      counts,
      leads: rows.map(({ activities, ...l }) => ({ ...l, lastActivity: activities[0] ?? null })),
    };
  }

  async detail(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: { activities: { orderBy: { createdAt: 'desc' } } },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async setStatus(id: string, status: LeadStatus, actorUserId: string) {
    const lead = await this.detail(id);
    if (lead.status === status) return this.detail(id);
    const author = await this.authorName(actorUserId);
    await this.prisma.lead.update({
      where: { id },
      data: {
        status, lastActivityAt: new Date(),
        activities: { create: { kind: 'STATUS_CHANGED', text: `${lead.status} → ${status}`, author } },
      },
    });
    return this.detail(id);
  }

  async addNote(id: string, text: string, actorUserId: string) {
    await this.detail(id);
    const author = await this.authorName(actorUserId);
    await this.prisma.lead.update({
      where: { id },
      data: { lastActivityAt: new Date(), activities: { create: { kind: 'NOTE', text, author } } },
    });
    return this.detail(id);
  }

  async exportCsv(status?: string): Promise<string> {
    const rows = await this.prisma.lead.findMany({
      where: isStatus(status) ? { status } : {},
      orderBy: { createdAt: 'desc' },
      take: 5000,
      include: { activities: { orderBy: { createdAt: 'desc' } } },
    });
    const head = ['Name', 'Email', 'Phone', 'Country', 'School', 'Status', 'Came from', 'First seen', 'Last activity', 'Latest note'];
    const lines = rows.map((l) => {
      const sources = [...new Set(l.activities.filter((a) => a.kind !== 'NOTE' && a.kind !== 'STATUS_CHANGED').map((a) => SOURCE_LABEL[a.kind]))];
      const note = l.activities.find((a) => a.kind === 'NOTE');
      return [
        l.name, l.email, l.phone, l.countryCode, l.schoolName, l.status, sources.join(' + '),
        l.createdAt.toISOString(), l.lastActivityAt.toISOString(), note?.text,
      ].map(csvCell).join(',');
    });
    return [head.join(','), ...lines].join('\r\n') + '\r\n';
  }

  private async authorName(userId: string) {
    const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { fullName: true } });
    return u?.fullName ?? 'Admin';
  }
}

const STATUSES: readonly string[] = ['NEW', 'CONTACTED', 'DEMO_BOOKED', 'SIGNED_UP', 'LOST'];
const isStatus = (s?: string): s is LeadStatus => !!s && STATUSES.includes(s);
const SOURCE_LABEL: Record<LeadActivityKind, string> = {
  CHAT_STARTED: 'Chat', DEMO_REQUESTED: 'Demo request', SIGNUP_REQUESTED: 'Signup', NOTE: 'Note', STATUS_CHANGED: 'Status',
};

/** RFC-4180 quoting, plus a guard against spreadsheet formula injection (=, +, -, @ at the start of a cell). */
export function csvCell(value: unknown): string {
  let s = value == null ? '' : String(value);
  const looksLikePhone = /^\+\d[\d\s().-]*$/.test(s);
  if (/^[=+\-@\t\r]/.test(s) && !looksLikePhone) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
