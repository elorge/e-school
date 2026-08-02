// backend/src/modules/lesson-notes/lesson-notes.module.ts
import { Module } from '@nestjs/common';
import { LessonNotesService } from './lesson-notes.service';
import { LessonNotesController } from './lesson-notes.controller';
import { LessonMaterialsService } from './lesson-materials.service';

@Module({ providers: [LessonNotesService, LessonMaterialsService], controllers: [LessonNotesController] })
export class LessonNotesModule {}