// backend/src/modules/chat/chat-admin.controller.ts
import { Controller, Delete, Get, HttpCode, NotFoundException, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

// Never select `token` here: it is the visitor's private key to their own chat.
const CONTACT_FIELDS = {
  id: true, tag: true, name: true, email: true, phone: true, countryCode: true,
  locale: true, pageUrl: true, waitingSince: true, lastAgentAt: true, createdAt: true,
} as const;

/** Platform super-admin view of website chats (history, transcripts, deletion on request). */
@UseGuards(RolesGuard)
@Controller('platform/chats')
export class ChatAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Roles(Role.SUPER_ADMIN)
  @Get()
  async list(@Query('filter') filter?: string, @Query('q') q?: string) {
    const search = q?.trim().slice(0, 80);
    const rows = await this.prisma.chatConversation.findMany({
      where: {
        ...(filter === 'waiting' ? { waitingSince: { not: null } } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { email: { contains: search, mode: 'insensitive' as const } },
                { phone: { contains: search } },
                { tag: { contains: search.replace('#', '').toLowerCase() } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        ...CONTACT_FIELDS,
        _count: { select: { messages: true } },
        messages: { orderBy: { seq: 'desc' }, take: 1, select: { sender: true, text: true, createdAt: true } },
      },
    });
    return rows.map(({ messages, _count, ...c }) => ({ ...c, messageCount: _count.messages, lastMessage: messages[0] ?? null }));
  }

  @Roles(Role.SUPER_ADMIN)
  @Get(':id')
  async detail(@Param('id', new ParseUUIDPipe()) id: string) {
    const conv = await this.prisma.chatConversation.findUnique({
      where: { id },
      select: {
        ...CONTACT_FIELDS,
        messages: { orderBy: { seq: 'asc' }, select: { id: true, seq: true, sender: true, text: true, agentName: true, createdAt: true } },
      },
    });
    if (!conv) throw new NotFoundException('Chat not found');
    return conv;
  }

  /** For data-deletion requests. Messages go with it (cascade). */
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(204)
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    const res = await this.prisma.chatConversation.deleteMany({ where: { id } });
    if (!res.count) throw new NotFoundException('Chat not found');
  }
}
