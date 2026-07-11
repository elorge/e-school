// backend/src/modules/health/health.controller.ts
import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { Public } from '../../common/decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async check() {
    const startedAt = Date.now();

    try {
      // Cheapest possible query that proves the DB connection is live —
      // doesn't touch any real table, just confirms Postgres answers.
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'unreachable',
        message: err instanceof Error ? err.message : 'Unknown database error',
      });
    }

    return {
      status: 'ok',
      database: 'connected',
      uptimeSeconds: Math.floor(process.uptime()),
      responseTimeMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    };
  }
}