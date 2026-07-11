// backend/src/modules/users/users.controller.ts
import { Controller, Delete, ForbiddenException, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(TenantGuard, RolesGuard)
@Controller(':school/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.SCHOOL_ADMIN)
  @Get()
  findAll(@Req() request: Request) {
    return this.usersService.findBySchool(request.schoolId!);
  }

@Roles(Role.SCHOOL_ADMIN)
  @Delete(':id')
  async remove(
    @Req() request: Request,
    @Param('id') id: string,
    @Query('reassignToStaffId') reassignToStaffId?: string,
  ) {
    // Ownership rule (spec doc §5): a School Admin may only remove staff
    // belonging to their own school — RolesGuard alone can't check that.
    const target = await this.usersService.findById(id);
    if (!target || target.schoolId !== request.schoolId) {
      throw new ForbiddenException('This user does not belong to your school');
    }
    return this.usersService.remove(request.schoolId!, id, reassignToStaffId);
  }
}