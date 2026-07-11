// backend/src/modules/uploads/uploads.controller.ts
import { Controller, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { UploadsService } from './uploads.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

const IMAGE_LIMITS = { fileSize: 5 * 1024 * 1024 }; // 5MB

@UseGuards(TenantGuard, RolesGuard)
@Controller(':school/uploads')
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly prisma: PrismaService,
  ) {}

  @Roles(Role.SCHOOL_ADMIN)
  @Post('school-logo')
  @UseInterceptors(FileInterceptor('file', { limits: IMAGE_LIMITS }))
  async uploadSchoolLogo(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadsService.uploadImage(file.buffer, `elorge/schools/${req.schoolId}/branding`);
    await this.prisma.school.update({ where: { id: req.schoolId! }, data: { logoUrl: url } });
    return { url };
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post('student-photo/:studentId')
  @UseInterceptors(FileInterceptor('file', { limits: IMAGE_LIMITS }))
  async uploadStudentPhoto(@Req() req: Request, @Param('studentId') studentId: string, @UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadsService.uploadImage(file.buffer, `elorge/schools/${req.schoolId}/students/${studentId}`);
    await this.prisma.student.update({ where: { id: studentId }, data: { photoUrl: url } });
    return { url };
  }
}