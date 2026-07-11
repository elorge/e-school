// backend/src/modules/calendar/calendar.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(TenantGuard, RolesGuard)
@Controller(':school/calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get()
  findAll(@Req() request: Request, @Query('termId') termId?: string) {
    return this.calendarService.findAll(request.schoolId!, termId);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get('pdf')
  async downloadPdf(@Req() request: Request, @Query('termId') termId: string, @Res() res: Response) {
    const pdfBuffer = await this.calendarService.renderTermCalendarPdf(request.schoolId!, termId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="calendar-${termId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Post()
  create(@Req() request: Request, @Body() body: CreateCalendarEventDto) {
    return this.calendarService.create(request.schoolId!, body);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Patch(':id')
  update(@Req() request: Request, @Param('id') id: string, @Body() body: UpdateCalendarEventDto) {
    return this.calendarService.update(request.schoolId!, id, body);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Delete(':id')
  remove(@Req() request: Request, @Param('id') id: string) {
    return this.calendarService.remove(request.schoolId!, id);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Post('generate-term-schedule')
  generateDraft(
    @Body() body: { termId: string; startDate: string; weeks: number; midtermBreakWeek?: number; examWeeks?: number },
  ) {
    return this.calendarService.generateDraft(body.termId, body.startDate, body.weeks, {
      midtermBreakWeek: body.midtermBreakWeek,
      examWeeks: body.examWeeks,
    });
  }
}