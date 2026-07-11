// backend/src/modules/results/results.controller.ts
import { Body, Controller, ForbiddenException, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ResultsService } from './results.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { Role } from '@prisma/client';

@UseGuards(TenantGuard, RolesGuard)
@Controller(':school/students/:studentId/results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get(':termId')
  findOne(@Req() request: Request, @Param('studentId') studentId: string, @Param('termId') termId: string) {
    return this.resultsService.findForStudentTerm(request.schoolId!, studentId, termId);
  }

  // Ownership rule (spec doc §5): a STAFF caller may only submit results
  // under their own classTeacherId; a SCHOOL_ADMIN may submit for anyone.
  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post(':termId')
  upsert(
    @Req() request: Request,
    @Param('studentId') studentId: string,
    @Param('termId') termId: string,
    @Body() body: { subjectScores: Record<string, number>; teacherComment?: string; classTeacherId: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (user.role === Role.STAFF && body.classTeacherId !== user.id) {
      throw new ForbiddenException('You may only submit results under your own name');
    }
    return this.resultsService.upsertResult(
      request.schoolId!,
      studentId,
      termId,
      body.subjectScores,
      body.teacherComment ?? null,
      body.classTeacherId,
    );
  }
}