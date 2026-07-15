// backend/src/modules/students/students.module.ts
import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { SchoolsModule } from '../schools/schools.module';
import { IdCardsModule } from '../id-cards/id-cards.module';

@Module({
  imports: [SchoolsModule, IdCardsModule],
  providers: [StudentsService],
  controllers: [StudentsController],
  exports: [StudentsService],
})
export class StudentsModule {}