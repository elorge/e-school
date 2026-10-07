// backend/src/modules/leads/leads.controller.ts
import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Response } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { LeadsService } from './leads.service';
import { AddLeadNoteDto, UpdateLeadStatusDto } from './leads.dto';

/** Platform super-admin lead pipeline: chats, demo requests and signups in one place. */
@UseGuards(RolesGuard)
@Controller('platform/leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Roles(Role.SUPER_ADMIN)
  @Get()
  list(@Query('status') status?: string, @Query('q') q?: string) {
    return this.leads.list(status, q);
  }

  // Declared before ':id' so "export" is never mistaken for an id.
  @Roles(Role.SUPER_ADMIN)
  @Get('export')
  async export(@Res({ passthrough: true }) res: Response, @Query('status') status?: string) {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="elorge-leads-${new Date().toISOString().slice(0, 10)}.csv"`);
    return '\uFEFF' + (await this.leads.exportCsv(status)); // BOM so Excel reads accents correctly
  }

  @Roles(Role.SUPER_ADMIN)
  @Get(':id')
  detail(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.leads.detail(id);
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch(':id/status')
  setStatus(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateLeadStatusDto, @CurrentUser() user: AuthenticatedUser) {
    return this.leads.setStatus(id, dto.status, user.id);
  }

  @Roles(Role.SUPER_ADMIN)
  @Post(':id/notes')
  addNote(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: AddLeadNoteDto, @CurrentUser() user: AuthenticatedUser) {
    return this.leads.addNote(id, dto.text, user.id);
  }
}
