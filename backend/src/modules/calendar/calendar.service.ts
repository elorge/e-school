// backend/src/modules/calendar/calendar.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';

const EVENT_TYPE_LABELS: Record<string, string> = {
  TERM_START: 'Term Starts',
  TERM_END: 'Term Ends',
  MIDTERM_BREAK: 'Midterm Break',
  EXAM_PERIOD: 'Examinations',
  RESUMPTION: 'Resumption',
  PTA_MEETING: 'PTA Meeting',
  HOLIDAY: 'Holiday',
  CUSTOM: 'Event',
};

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly http: HttpService,
  ) {}

  findAll(schoolId: string, termId?: string) {
    return this.prisma.academicCalendarEvent.findMany({
      where: { schoolId, ...(termId ? { termId } : {}) },
      orderBy: { startDate: 'asc' },
    });
  }

  async findOneOrThrow(schoolId: string, id: string) {
    const event = await this.prisma.academicCalendarEvent.findFirst({ where: { id, schoolId } });
    if (!event) throw new NotFoundException('Calendar event not found');
    return event;
  }

  create(schoolId: string, dto: CreateCalendarEventDto) {
    return this.prisma.academicCalendarEvent.create({
      data: {
        schoolId,
        termId: dto.termId,
        type: dto.type,
        title: dto.title,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        description: dto.description,
      },
    });
  }

  async update(schoolId: string, id: string, dto: UpdateCalendarEventDto) {
    await this.findOneOrThrow(schoolId, id); // 404s cleanly instead of a bare Prisma error
    return this.prisma.academicCalendarEvent.update({
      where: { id },
      data: {
        ...(dto.termId !== undefined ? { termId: dto.termId } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.startDate !== undefined ? { startDate: new Date(dto.startDate) } : {}),
        ...(dto.endDate !== undefined ? { endDate: dto.endDate ? new Date(dto.endDate) : null } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
      },
    });
  }

  async remove(schoolId: string, id: string) {
    await this.findOneOrThrow(schoolId, id);
    return this.prisma.academicCalendarEvent.delete({ where: { id } });
  }

  /**
   * Draft generator — returns proposed events, does NOT save anything.
   * Admin reviews/edits in the UI, then calls saveDraft with the final list.
   */
  generateDraft(
    termId: string,
    startDateIso: string,
    weeks: number,
    opts: { midtermBreakWeek?: number; examWeeks?: number },
  ) {
    const startDate = new Date(startDateIso);
    const addWeeks = (d: Date, n: number) => new Date(d.getTime() + n * 7 * 86_400_000);
    const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);

    const draft: Omit<CreateCalendarEventDto, 'termId'>[] = [];
    draft.push({ type: 'RESUMPTION' as const, title: 'Resumption', startDate: startDate.toISOString() });

    if (opts.midtermBreakWeek) {
      const breakStart = addWeeks(startDate, opts.midtermBreakWeek - 1);
      draft.push({
        type: 'MIDTERM_BREAK' as const,
        title: 'Midterm Break',
        startDate: breakStart.toISOString(),
        endDate: addDays(breakStart, 4).toISOString(),
      });
    }
    if (opts.examWeeks) {
      const examStart = addWeeks(startDate, weeks - opts.examWeeks);
      draft.push({
        type: 'EXAM_PERIOD' as const,
        title: 'Examinations',
        startDate: examStart.toISOString(),
        endDate: addWeeks(examStart, opts.examWeeks).toISOString(),
      });
    }
    draft.push({ type: 'TERM_END' as const, title: 'Term Ends', startDate: addWeeks(startDate, weeks).toISOString() });

    return draft.map((e) => ({ ...e, termId }));
  }

  /**
   * Same pattern as ReportsService.fetchLogoBuffer — a dead/slow logo URL
   * must never fail the whole document, just render without it.
   */
  private async fetchLogoBuffer(url: string): Promise<Buffer | null> {
    try {
      const response = await firstValueFrom(this.http.get(url, { responseType: 'arraybuffer', timeout: 5000 }));
      return Buffer.from(response.data);
    } catch (err) {
      this.logger.warn(`Failed to fetch school logo at ${url} — rendering calendar without it: ${err}`);
      return null;
    }
  }

  async renderTermCalendarPdf(schoolId: string, termId: string): Promise<Buffer> {
    const [term, school, template, events] = await Promise.all([
      this.prisma.term.findUniqueOrThrow({ where: { id: termId } }),
      this.prisma.school.findUniqueOrThrow({ where: { id: schoolId } }),
      this.prisma.reportTemplate.findUnique({ where: { schoolId } }),
      this.prisma.academicCalendarEvent.findMany({
        where: { schoolId, termId },
        orderBy: { startDate: 'asc' },
      }),
    ]);

    const logoBuffer = template?.schoolLogoUrl ? await this.fetchLogoBuffer(template.schoolLogoUrl) : null;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header — same branding rule as report cards: school's own logo, never Elorge's.
      if (logoBuffer) {
        try {
          doc.image(logoBuffer, doc.page.margins.left, doc.page.margins.top, { width: 50, height: 50, fit: [50, 50] });
        } catch (err) {
          this.logger.warn(`Logo buffer for school ${schoolId} was not a valid image — skipping: ${err}`);
        }
      }

      doc.fontSize(18).font('Helvetica-Bold').text(school.name, { align: 'center' });
      doc.moveDown(0.2);
      doc.fontSize(13).font('Helvetica').text(`${term.name} — Academic Calendar`, { align: 'center' });
      doc.moveDown(1.5);

      if (events.length === 0) {
        doc.fontSize(11).font('Helvetica-Oblique').text('No calendar events have been added for this term yet.', { align: 'center' });
      }

      // Simple two-column table: date range | event.
      const rowStartX = doc.page.margins.left;
      const dateColWidth = 160;
      const eventColWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right - dateColWidth;

      for (const event of events) {
        const y = doc.y;
        const startStr = event.startDate.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
        const dateLabel = event.endDate
          ? `${startStr} – ${event.endDate.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}`
          : startStr;

        doc.fontSize(9).font('Helvetica-Bold').text(dateLabel, rowStartX, y, { width: dateColWidth });
        doc
          .fontSize(9)
          .font('Helvetica')
          .text(`${EVENT_TYPE_LABELS[event.type] ?? event.type}: ${event.title}`, rowStartX + dateColWidth, y, {
            width: eventColWidth,
          });

        if (event.description) {
          doc.moveDown(0.1);
          doc
            .fontSize(8)
            .font('Helvetica-Oblique')
            .fillColor('#666')
            .text(event.description, rowStartX + dateColWidth, doc.y, { width: eventColWidth });
          doc.fillColor('#000');
        }

        doc.moveDown(0.6);
        // Thin divider line between rows.
        doc
          .moveTo(rowStartX, doc.y)
          .lineTo(doc.page.width - doc.page.margins.right, doc.y)
          .strokeColor('#e5e5e5')
          .stroke();
        doc.moveDown(0.4);
      }

      doc.end();
    });
  }
}