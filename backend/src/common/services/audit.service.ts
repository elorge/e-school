// backend/src/common/services/audit.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fire-and-forget on purpose — an audit write failing must never
   * block the actual business operation it's logging (same principle
   * as EmailService never throwing). Logged locally if it fails so
   * it's not silently invisible either.
   */
  async log(entry: {
    schoolId?: string | null;
    actorId?: string | null;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown>;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          ...entry,
          metadata: entry.metadata as Prisma.InputJsonValue | undefined,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to write audit log for ${entry.action}: ${err}`);
    }
  }
}