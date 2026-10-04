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
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/auth.types';

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

  @Roles(Role.SCHOOL_ADMIN)
  @Post('school-signature')
  @UseInterceptors(FileInterceptor('file', { limits: IMAGE_LIMITS }))
  async uploadSchoolSignature(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadsService.uploadImage(file.buffer, `elorge/schools/${req.schoolId}/branding`);
    await this.prisma.school.update({ where: { id: req.schoolId! }, data: { signatureUrl: url } });
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

  /**
   * A STAFF caller may only change their OWN photo; SCHOOL_ADMIN and
   * help a colleague who can't take their own photo.
   */
  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post('staff-photo/:staffProfileId')
  @UseInterceptors(FileInterceptor('file', { limits: IMAGE_LIMITS }))
  async uploadStaffPhoto(
    @Req() req: Request,
    @Param('staffProfileId') staffProfileId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) throw new BadRequestException('No image was uploaded');
    const profile = await this.prisma.staffProfile.findFirst({ where: { id: staffProfileId, schoolId: req.schoolId! } });
    if (!profile) throw new NotFoundException('Staff profile not found');
    if (user.role === Role.STAFF && profile.userId !== user.id) {
      throw new ForbiddenException('You may only change your own photo');
    }
    const url = await this.uploadsService.uploadImage(file.buffer, `elorge/schools/${req.schoolId}/staff/${staffProfileId}`);
    await this.prisma.staffProfile.update({ where: { id: staffProfileId }, data: { photoUrl: url } });
    return { url };
  }
}
