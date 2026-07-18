// backend/src/modules/students/students.controller.ts
import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { SchoolsService } from '../schools/schools.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { Role } from '@prisma/client';

@UseGuards(TenantGuard, RolesGuard)
@Controller(':school/students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly schoolsService: SchoolsService,
  ) {}

@Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get()
  findAll(@Req() request: Request, @Query('classId') classId?: string, @Query('includeWithdrawn') includeWithdrawn?: string) {
    return this.studentsService.findBySchool(request.schoolId!, classId, includeWithdrawn === 'true');
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get('pending-sync')
  findPendingSync(@Req() request: Request) {
    return this.studentsService.findPendingSync(request.schoolId!);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get('import/template')
  async downloadTemplate(@Res() res: Response) {
    const buffer = this.studentsService.generateImportTemplate();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="student-import-template.xlsx"`,
    });
    res.send(buffer);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post('import')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async bulkImport(@Req() request: Request, @UploadedFile() file: Express.Multer.File, @CurrentUser() user: AuthenticatedUser) {
    const school = await this.schoolsService.findByIdOrThrow(request.schoolId!);
    return this.studentsService.bulkImport(request.schoolId!, school.code, user.id, file.buffer);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get(':id')
  findOne(@Req() request: Request, @Param('id') id: string) {
    return this.studentsService.findByIdOrThrow(request.schoolId!, id);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Patch(':id/withdraw')
  withdraw(@Req() request: Request, @Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.studentsService.withdraw(request.schoolId!, id, user);
  }

  /**
   * Sync endpoint: a staff device calls this once reconnected for each
   * student queued locally while offline. Assigns the sequential
   * Admission ID server-side — see StudentsService.createAndAssignId.
   */
  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post()
  async create(@Req() request: Request, @Body() body: CreateStudentDto, @CurrentUser() user: AuthenticatedUser) {
    const school = await this.schoolsService.findByIdOrThrow(request.schoolId!);
    const student = await this.studentsService.createAndAssignId(
      request.schoolId!,
      school.code,
      body.classId,
      user.id,
      body.clientReferenceId,
      {
        firstName: body.firstName,
        lastName: body.lastName,
        photoUrl: body.photoUrl,
        admissionYear: body.admissionYear,
      },
    );
    // Best-effort — if this fails, "Issue ID card" in Documents still covers it manually.
    await this.studentsService.ensureIdCard(request.schoolId!, student.id).catch(() => null);
    return student;
  }
}