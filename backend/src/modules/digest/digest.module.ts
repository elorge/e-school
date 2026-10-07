// backend/src/modules/digest/digest.module.ts
import { Module } from '@nestjs/common';
import { DigestService } from './digest.service';

@Module({ providers: [DigestService], exports: [DigestService] })
export class DigestModule {}
