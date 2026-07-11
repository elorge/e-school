// backend/src/modules/terms/terms.controller.ts
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { TermsService } from './terms.service';
import { CreateTermDto } from './dto/create-term.dto';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(TenantGuard, RolesGuard)
@Controller(':school/terms')
export class TermsController {
  constructor(private readonly termsService: TermsService) {}

@Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get()
  findAll(@Req() request: Request) {
    return this.termsService.findBySchool(request.schoolId!);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get('sessions')
  listSessions(@Req() request: Request) {
    return this.termsService.listSessions(request.schoolId!);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Post()
  create(@Req() request: Request, @Body() body: CreateTermDto) {
    return this.termsService.create(request.schoolId!, body.name, body.academicSession, body.termNumber, body.startDate, body.endDate);
  }
}