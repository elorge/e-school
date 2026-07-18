// backend/src/modules/classes/classes.controller.ts
import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ClassesService } from './classes.service';
import { PromoteStudentsDto } from './dto/promote-students.dto';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { Role } from '@prisma/client';

@UseGuards(TenantGuard, RolesGuard)
@Controller(':school/classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get()
  findAll(@Req() request: Request) {
    return this.classesService.findBySchool(request.schoolId!);
  }

@Roles(Role.SCHOOL_ADMIN)
  @Post()
  create(
    @Req() request: Request,
    @Body() body: { name: string; classTeacherId?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.classesService.create(request.schoolId!, body.name, user.id, body.classTeacherId);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Patch(':id/assign-teacher')
  assignTeacher(@Req() request: Request, @Param('id') id: string, @Body() body: { classTeacherId: string }) {
    return this.classesService.assignTeacher(request.schoolId!, id, body.classTeacherId);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Post('promote')
  promote(@Req() request: Request, @Body() body: PromoteStudentsDto) {
    return this.classesService.promoteStudents(request.schoolId!, body.toClassId, body.studentIds);
  }
}