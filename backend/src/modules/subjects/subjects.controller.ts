// backend/src/modules/subjects/subjects.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(TenantGuard, RolesGuard)
@Controller(':school')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  // ── Catalog — SCHOOL_ADMIN manages, everyone can read ───────────────────
  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get('subjects')
  listCatalog(@Req() req: Request) {
    return this.subjectsService.listCatalog(req.schoolId!);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Post('subjects')
  createInCatalog(@Req() req: Request, @Body() body: CreateSubjectDto) {
    return this.subjectsService.createInCatalog(req.schoolId!, body.name);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Delete('subjects/:subjectId')
  removeFromCatalog(@Req() req: Request, @Param('subjectId') subjectId: string) {
    return this.subjectsService.removeFromCatalog(req.schoolId!, subjectId);
  }

  // ── Per-class assignment ────────────────────────────────────────────────
  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get('classes/:classId/subjects')
  listForClass(@Req() req: Request, @Param('classId') classId: string) {
    return this.subjectsService.listForClass(req.schoolId!, classId);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Post('classes/:classId/subjects')
  assignToClass(@Req() req: Request, @Param('classId') classId: string, @Body() body: { subjectId: string }) {
    return this.subjectsService.assignToClass(req.schoolId!, classId, body.subjectId);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Delete('classes/:classId/subjects/:subjectId')
  removeFromClass(@Param('classId') classId: string, @Param('subjectId') subjectId: string) {
    return this.subjectsService.removeFromClass(classId, subjectId);
  }
}