// backend/src/modules/lesson-notes/lesson-notes.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { LessonNotesService } from './lesson-notes.service';
import { CreateLessonNoteDto } from './dto/create-lesson-note.dto';
import { UpdateLessonNoteDto } from './dto/update-lesson-note.dto';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LessonMaterialsService } from './lesson-materials.service';
import { UploadMaterialDto } from './dto/upload-material.dto';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { Role, LessonNoteStatus } from '@prisma/client';

@UseGuards(TenantGuard, RolesGuard)
@Controller(':school/lessons')
export class LessonNotesController {
  constructor(
    private readonly lessonNotesService: LessonNotesService,
    private readonly lessonMaterialsService: LessonMaterialsService,
  ) {}

  // ── Staff ──────────────────────────────────────────────────────────────
  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get()
  findAllForStaff(@Req() req: Request, @Query('classId') classId?: string, @Query('termId') termId?: string) {
    return this.lessonNotesService.findAllForStaff(req.schoolId!, classId, termId);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.lessonNotesService.findOneOrThrow(req.schoolId!, id);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post()
  create(@Req() req: Request, @Body() body: CreateLessonNoteDto, @CurrentUser() user: AuthenticatedUser) {
    return this.lessonNotesService.create(req.schoolId!, user.id, body);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() body: UpdateLessonNoteDto) {
    return this.lessonNotesService.update(req.schoolId!, id, body);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post(':id/publish')
  publish(@Req() req: Request, @Param('id') id: string) {
    return this.lessonNotesService.setStatus(req.schoolId!, id, LessonNoteStatus.PUBLISHED);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post(':id/unpublish')
  unpublish(@Req() req: Request, @Param('id') id: string) {
    return this.lessonNotesService.setStatus(req.schoolId!, id, LessonNoteStatus.DRAFT);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post(':id/materials')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 25 * 1024 * 1024 } }))
  uploadMaterial(
    @Req() req: Request,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadMaterialDto,
  ) {
    return this.lessonMaterialsService.uploadMaterial(req.schoolId!, id, file, body.insertAfter);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Patch(':id/materials/reorder')
  reorderMaterials(@Req() req: Request, @Param('id') id: string, @Body() body: { orderedIds: string[] }) {
    return this.lessonMaterialsService.reorder(req.schoolId!, id, body.orderedIds);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Delete(':id/materials/:materialId')
  deleteMaterial(@Req() req: Request, @Param('id') id: string, @Param('materialId') materialId: string) {
    return this.lessonMaterialsService.remove(req.schoolId!, id, materialId);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.lessonNotesService.remove(req.schoolId!, id);
  }

  // ── Public — students at home, gated by their own Admission ID, PUBLISHED only ──
  @Public()
  @Get('public/list')
  findPublicList(@Req() req: Request, @Query('admissionId') admissionId: string, @Query('subject') subject?: string) {
    return this.lessonNotesService.findPublicList(req.schoolId!, admissionId, subject);
  }

  @Public()
  @Get('public/:id')
  findPublicOne(@Req() req: Request, @Param('id') id: string, @Query('admissionId') admissionId: string) {
    return this.lessonNotesService.findPublicOne(req.schoolId!, id, admissionId);
  }
}