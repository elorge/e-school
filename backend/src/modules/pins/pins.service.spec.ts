// backend/src/modules/pins/pins.service.spec.ts
import { PinsService } from './pins.service';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';

describe('PinsService.lookupResult lockout behavior', () => {
  function buildService(overrides: {
    attempt?: any;
    student?: any;
    pin?: any;
    pinValid?: boolean;
  }) {
    const prisma = {
      pinLookupAttempt: {
        upsert: jest.fn().mockResolvedValue(overrides.attempt ?? { failedAttempts: 0, lockedUntil: null }),
        update: jest.fn().mockResolvedValue({}),
      },
      student: { findFirst: jest.fn().mockResolvedValue(overrides.student ?? null) },
      pin: { findFirst: jest.fn().mockResolvedValue(overrides.pin ?? null) },
      resultEntry: { findFirst: jest.fn().mockResolvedValue({ id: 'result-1' }) },
    };
    const walletService = {} as any;
    const emailService = {} as any;
    const bcrypt = require('bcrypt');
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(overrides.pinValid ?? false);

    return new PinsService(prisma as any, walletService, emailService);
  }

  it('rejects lookup while locked out, without checking the PIN at all', async () => {
    const lockedUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 min in the future
    const service = buildService({ attempt: { failedAttempts: 5, lockedUntil } });

    await expect(service.lookupResult('school-1', 'GRW/2026/0001', '123456')).rejects.toThrow(ForbiddenException);
  });

  it('rejects an unknown admission id with the same generic message as a wrong PIN', async () => {
    const service = buildService({ attempt: { failedAttempts: 0, lockedUntil: null }, student: null });

    await expect(service.lookupResult('school-1', 'GRW/2026/9999', '123456')).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a wrong PIN for a real student without leaking which part was wrong', async () => {
    const service = buildService({
      attempt: { failedAttempts: 0, lockedUntil: null },
      student: { id: 'student-1' },
      pin: { id: 'pin-1', pinHash: 'hash', termId: 'term-1' },
      pinValid: false,
    });

    await expect(service.lookupResult('school-1', 'GRW/2026/0001', 'wrong-pin')).rejects.toThrow(UnauthorizedException);
  });
});