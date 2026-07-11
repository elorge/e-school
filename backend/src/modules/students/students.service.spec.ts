// backend/src/modules/students/students.service.spec.ts
import { StudentsService } from './students.service';
import { Role } from '@prisma/client';

describe('StudentsService', () => {
  describe('createAndAssignId', () => {
    it('returns the existing student instead of creating a duplicate on a retried clientReferenceId', async () => {
      const existingStudent = { id: 'student-1', clientReferenceId: 'client-ref-abc' };
      const prisma = {
        student: {
          findUnique: jest.fn().mockResolvedValue(existingStudent),
          count: jest.fn(),
          create: jest.fn(),
        },
        $transaction: jest.fn(),
      };
      const service = new StudentsService(prisma as any);

      const result = await service.createAndAssignId('school-1', 'GRW', 'class-1', 'staff-1', 'client-ref-abc', {
        firstName: 'Ada',
        lastName: 'Obi',
        admissionYear: 2026,
      });

      expect(result).toBe(existingStudent);
      expect(prisma.$transaction).not.toHaveBeenCalled(); // never even attempted a second create
    });
  });

  describe('withdraw', () => {
    it('blocks a STAFF caller who is not this class\'s teacher', async () => {
      const prisma = {
        student: { findFirst: jest.fn().mockResolvedValue({ id: 's1', classId: 'class-1', schoolId: 'school-1' }) },
        class: { findUniqueOrThrow: jest.fn().mockResolvedValue({ id: 'class-1', classTeacherId: 'teacher-A' }) },
      };
      const service = new StudentsService(prisma as any);

      await expect(
        service.withdraw('school-1', 's1', { id: 'teacher-B', role: Role.STAFF, schoolId: 'school-1' }),
      ).rejects.toThrow('class\'s teacher');
    });
  });
});