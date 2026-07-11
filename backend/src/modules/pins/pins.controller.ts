// backend/src/modules/pins/pins.controller.ts
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { PinsService } from './pins.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller(':school')
export class PinsController {
  constructor(private readonly pinsService: PinsService) {}

  // Auth + tenant + role required — only a School Admin can spend the
  // school's wallet balance generating PINs.
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(Role.SCHOOL_ADMIN)
  @Post('pins/generate')
  generate(
    @Req() request: Request,
    @Body()
    body: { termId: string; studentIds: string[]; pricePerStudentKobo: number; idempotencyKey: string },
  ) {
    return this.pinsService.generateBatch(
      request.schoolId!,
      body.termId,
      body.studentIds,
      body.pricePerStudentKobo,
      body.idempotencyKey,
    );
  }

  // Intentionally public — students have no account. TenantGuard still
  // runs to resolve :school -> schoolId, but skips the auth/role check
  // since there's no request.user. Additionally throttled at the HTTP
  // layer as defense-in-depth on top of the PinLookupAttempt-based
  // per-admissionId lock in the service.
  @Public()
  @UseGuards(TenantGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('results/lookup')
  lookup(@Req() request: Request, @Body() body: { admissionId: string; pin: string }) {
    return this.pinsService.lookupResult(request.schoolId!, body.admissionId, body.pin);
  }
}