// backend/src/modules/subjects/subjects.module.ts
import { Module } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';

@Module({ providers: [SubjectsService], controllers: [SubjectsController] })
export class SubjectsModule {}