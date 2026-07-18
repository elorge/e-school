// backend/src/modules/assessment/assessment.controller.ts
import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { AssessmentScoringService } from './assessment-scoring.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(TenantGuard, RolesGuard)
@Controller(':school')
export class AssessmentController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scoring: AssessmentScoringService,
  ) {}

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get('assessment-weights')
  list(@Req() req: Request, @Query('classId') classId: string, @Query('subject') subject?: string) {
    return this.scoring.getWeights(req.schoolId!, classId, subject ?? null as any);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Post('assessment-weights')
  async upsert(
    @Req() req: Request,
    @Body() body: { classId: string; subject?: string; components: { componentName: string; weightPercent: number }[] },
  ) {
    const total = body.components.reduce((s, c) => s + c.weightPercent, 0);
    if (total !== 100) throw new BadRequestException('Component weights must sum to exactly 100');

    await this.prisma.assessmentWeight.deleteMany({
      where: { schoolId: req.schoolId!, classId: body.classId, subject: body.subject ?? null },
    });
    await this.prisma.assessmentWeight.createMany({
      data: body.components.map((c) => ({
        schoolId: req.schoolId!,
        classId: body.classId,
        subject: body.subject ?? null,
        componentName: c.componentName,
        weightPercent: c.weightPercent,
      })),
    });
    return { saved: true };
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get('students/:studentId/assessment-components')
  listComponents(
    @Req() req: Request,
    @Param('studentId') studentId: string,
    @Query('termId') termId: string,
    @Query('subject') subject: string,
  ) {
    return this.scoring.listComponentScores(req.schoolId!, studentId, termId, subject);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post('students/:studentId/assessment-components')
  async recordComponent(
    @Req() req: Request,
    @Param('studentId') studentId: string,
    @Body() body: { termId: string; subject: string; componentName: string; score: number },
  ) {
    await this.scoring.recordComponentScore(req.schoolId!, studentId, body.termId, body.subject, body.componentName, body.score, 'MANUAL');
    return this.scoring.recomputeAndSync(req.schoolId!, studentId, body.termId, body.subject);
  }
}