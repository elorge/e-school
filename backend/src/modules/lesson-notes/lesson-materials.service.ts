// backend/src/modules/lesson-notes/lesson-materials.service.ts
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaService } from '../../prisma/prisma.service';
import { LessonMaterialType } from '@prisma/client';

const IMAGE_MIMES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const PDF_MIME = 'application/pdf';
const PPTX_MIME = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

@Injectable()
export class LessonMaterialsService {
  private readonly logger = new Logger(LessonMaterialsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async assertLessonNoteExists(schoolId: string, lessonNoteId: string) {
    const note = await this.prisma.lessonNote.findFirst({ where: { id: lessonNoteId, schoolId } });
    if (!note) throw new NotFoundException('Lesson note not found');
    return note;
  }

  /**
   * Images upload as a single material. PDFs and PPTX upload as
   * "image" resources on Cloudinary, which triggers Cloudinary's
   * document-to-image conversion — the response's `pages` count tells
   * us how many page images now exist, and each page is addressable
   * by inserting a `pg_<n>` transformation into the delivery URL.
   *
   * PPTX conversion specifically requires Cloudinary's Document
   * Conversion add-on. If it isn't enabled, Cloudinary still accepts
   * the upload but `pages` comes back as 1 (just a cover thumbnail) —
   * we catch that case and tell the teacher to export to PDF instead,
   * rather than silently showing only the first slide.
   */
  async uploadMaterial(schoolId: string, lessonNoteId: string, file: Express.Multer.File, insertAfter: string) {
    await this.assertLessonNoteExists(schoolId, lessonNoteId);
    const existingCount = await this.prisma.lessonMaterial.count({ where: { lessonNoteId } });

    if (IMAGE_MIMES.includes(file.mimetype)) {
      const uploaded = await this.uploadBufferToCloudinary(file.buffer);
      const material = await this.prisma.lessonMaterial.create({
        data: {
          lessonNoteId,
          type: LessonMaterialType.IMAGE,
          url: uploaded.secure_url,
          order: existingCount,
          insertAfter,
          originalFilename: file.originalname,
        },
      });
      return [material];
    }

    if (file.mimetype === PDF_MIME || file.mimetype === PPTX_MIME) {
      const uploaded = await this.uploadBufferToCloudinary(file.buffer);
      const pageCount = uploaded.pages ?? 1;

      if (pageCount <= 1 && file.mimetype === PPTX_MIME) {
        throw new BadRequestException(
          'This file only converted to a single preview image — PowerPoint conversion may not be enabled on the Cloudinary account. Try exporting the slides as a PDF and uploading that instead.',
        );
      }

      const type = file.mimetype === PDF_MIME ? LessonMaterialType.PDF_PAGE : LessonMaterialType.SLIDE;
      const created = [];
      for (let page = 1; page <= pageCount; page++) {
        const pageUrl = uploaded.secure_url.replace('/upload/', `/upload/pg_${page}/`);
        created.push(
          await this.prisma.lessonMaterial.create({
            data: {
              lessonNoteId,
              type,
              url: pageUrl,
              order: existingCount + page - 1,
              insertAfter,
              originalFilename: `${file.originalname} (page ${page})`,
            },
          }),
        );
      }
      return created;
    }

    throw new BadRequestException('Unsupported file type — upload an image, PDF, or PowerPoint (.pptx) file.');
  }

  private uploadBufferToCloudinary(buffer: Buffer): Promise<any> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'lesson-materials' }, (err, result) => {
        if (err || !result) return reject(err ?? new Error('Cloudinary upload failed'));
        resolve(result);
      });
      stream.end(buffer);
    });
  }

  async reorder(schoolId: string, lessonNoteId: string, orderedIds: string[]) {
    await this.assertLessonNoteExists(schoolId, lessonNoteId);
    await this.prisma.$transaction(orderedIds.map((id, index) => this.prisma.lessonMaterial.update({ where: { id }, data: { order: index } })));
    return this.prisma.lessonMaterial.findMany({ where: { lessonNoteId }, orderBy: { order: 'asc' } });
  }

  async remove(schoolId: string, lessonNoteId: string, materialId: string) {
    await this.assertLessonNoteExists(schoolId, lessonNoteId);
    const material = await this.prisma.lessonMaterial.findFirst({ where: { id: materialId, lessonNoteId } });
    if (!material) throw new NotFoundException('Material not found on this lesson note');
    await this.prisma.lessonMaterial.delete({ where: { id: materialId } });
    return { deleted: true };
  }
}