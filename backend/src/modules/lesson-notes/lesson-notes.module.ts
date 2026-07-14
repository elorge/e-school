// backend/src/modules/lesson-notes/lesson-notes.module.ts
import { Module } from '@nestjs/common';
import { LessonNotesService } from './lesson-notes.service';
import { LessonNotesController } from './lesson-notes.controller';

@Module({ providers: [LessonNotesService], controllers: [LessonNotesController] })
export class LessonNotesModule {}