// backend/src/modules/career-fields/career-fields.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { CareerFieldsService } from './career-fields.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(TenantGuard, RolesGuard)
@Controller(':school/career-fields')
export class CareerFieldsController {
  constructor(private readonly careerFieldsService: CareerFieldsService) {}

  // Staff can view (useful context when entering results/comments), only SCHOOL_ADMIN can edit.
  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get()
  list(@Req() req: Request) {
    return this.careerFieldsService.listForSchool(req.schoolId!);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Post()
  create(@Req() req: Request, @Body() body: { subject: string; field: string }) {
    return this.careerFieldsService.addSchoolMapping(req.schoolId!, body.subject, body.field);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.careerFieldsService.removeSchoolMapping(req.schoolId!, id);
  }
}