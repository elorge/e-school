// backend/src/modules/cbt/cbt.controller.ts
import { Body, Controller, Get, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { CbtService } from './cbt.service';
import { Public } from '../../common/decorators/roles.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CreateTestDto } from './dto/create-test.dto';
import { AddQuestionDto } from './dto/add-question.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { Role } from '@prisma/client';

@UseGuards(TenantGuard, RolesGuard)
@Controller(':school/cbt/tests')
export class CbtController {
  constructor(private readonly cbtService: CbtService) {}

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get()
  findAll(@Req() req: Request) {
    return this.cbtService.findBySchool(req.schoolId!);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.cbtService.findOneOrThrow(req.schoolId!, id);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post()
  create(@Req() req: Request, @Body() body: CreateTestDto, @CurrentUser() user: AuthenticatedUser) {
    return this.cbtService.createTest(req.schoolId!, user.id, body);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post(':id/questions')
  addQuestion(@Req() req: Request, @Param('id') id: string, @Body() body: AddQuestionDto) {
    return this.cbtService.addQuestion(req.schoolId!, id, body);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get(':id/paper/pdf')
  async downloadTestPaper(@Req() req: Request, @Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.cbtService.renderTestPaperPdf(req.schoolId!, id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="test-paper.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get(':id/questions/template')
  async downloadTemplate(@Req() req: Request, @Param('id') id: string, @Res() res: Response) {
    const test = await this.cbtService.findOneOrThrow(req.schoolId!, id);
    const buffer = this.cbtService.generateQuestionTemplate(test.title);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${test.title.replace(/\s+/g, '-')}-question-template.xlsx"`,
    });
    res.send(buffer);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post(':id/questions/bulk-upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  bulkUpload(@Req() req: Request, @Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.cbtService.bulkUploadQuestions(req.schoolId!, id, file.buffer);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post(':id/publish')
  publish(@Req() req: Request, @Param('id') id: string, @Body() body: { idempotencyKey: string; studentIds?: string[] }) {
    return this.cbtService.publishTest(req.schoolId!, id, body.idempotencyKey, body.studentIds);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get(':id/attempts')
  listAttempts(@Req() req: Request, @Param('id') id: string) {
    return this.cbtService.listAttempts(req.schoolId!, id);
  }

  /** Invigilating staff starts the session on the device the student is using. */
  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post(':id/attempts/start')
  startAttempt(@Req() req: Request, @Param('id') id: string, @Body() body: { studentId: string }) {
    return this.cbtService.getAttemptForStudent(req.schoolId!, id, body.studentId);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post('attempts/:attemptId/answer')
  saveAnswer(@Param('attemptId') attemptId: string, @Body() body: { questionId: string; selectedOptionIndex: number }) {
    return this.cbtService.saveAnswer(attemptId, body.questionId, body.selectedOptionIndex);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post('attempts/:attemptId/submit')
  submit(@Param('attemptId') attemptId: string) {
    return this.cbtService.submitAttempt(attemptId);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post('attempts/:attemptId/theory-score')
  gradeTheory(
    @Req() req: Request,
    @Param('attemptId') attemptId: string,
    @Body() body: { theoryScore: number },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cbtService.gradeTheory(req.schoolId!, attemptId, body.theoryScore, user.id);
  }

  /**
   * Public — no staff login, no account. A student on any lab computer
   * enters their own Admission ID + the code the invigilator read out.
   * Throttled same as result lookup, since it's an unauthenticated,
   * guessable-credential endpoint.
   */
  @Public()
  @UseGuards(TenantGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('student-login')
  studentLogin(@Req() req: Request, @Body() body: { accessCode: string; admissionId: string }) {
    return this.cbtService.startAttemptByAccessCode(req.schoolId!, body.accessCode, body.admissionId);
  }
}