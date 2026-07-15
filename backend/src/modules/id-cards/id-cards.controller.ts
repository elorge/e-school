// backend/src/modules/id-cards/id-cards.controller.ts
import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { IdCardsService } from './id-cards.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { Role } from '@prisma/client';

@UseGuards(TenantGuard, RolesGuard)
@Controller(':school/students/:studentId')
export class IdCardsController {
  constructor(private readonly idCardsService: IdCardsService) {}

@Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get('attendance')
  findAll(@Req() request: Request, @Param('studentId') studentId: string) {
    return this.idCardsService.findByStudent(request.schoolId!, studentId);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get('id-card/pdf')
  async downloadIdCard(@Req() request: Request, @Param('studentId') studentId: string, @Res() res: Response) {
    const pdfBuffer = await this.idCardsService.renderIdCardPdf(request.schoolId!, studentId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="id-card-${studentId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post('id-card/issue')
  issue(@Req() request: Request, @Param('studentId') studentId: string) {
    return this.idCardsService.issueCard(request.schoolId!, studentId);
  }

  /** Sync endpoint: a gate-scanner device calls this once reconnected for each queued scan. */
  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post('attendance')
  log(
    @Req() request: Request,
    @Param('studentId') studentId: string,
    @Body() body: { occurredAt: string; clientReferenceId: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.idCardsService.logAttendance(request.schoolId!, studentId, user.id, body.occurredAt, body.clientReferenceId);
  }
}