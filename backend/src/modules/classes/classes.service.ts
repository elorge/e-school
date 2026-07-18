// backend/src/modules/classes/classes.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  findBySchool(schoolId: string) {
    return this.prisma.class.findMany({
      where: { schoolId },
      include: { students: true },
      orderBy: { name: 'asc' },
    });
  }

  create(schoolId: string, name: string, createdByStaffId: string, classTeacherId?: string) {
    return this.prisma.class.create({ data: { schoolId, name, createdByStaffId, classTeacherId } });
  }

  assignTeacher(schoolId: string, classId: string, classTeacherId: string) {
    return this.prisma.class.updateMany({
      where: { id: classId, schoolId },
      data: { classTeacherId },
    });
  }

  async promoteStudents(schoolId: string, toClassId: string, studentIds: string[]) {
    const targetClass = await this.prisma.class.findFirst({ where: { id: toClassId, schoolId } });
    if (!targetClass) throw new NotFoundException('Target class not found');

    const result = await this.prisma.student.updateMany({
      where: { id: { in: studentIds }, schoolId, status: 'ACTIVE' },
      data: { classId: toClassId },
    });
    return { promoted: result.count };
  }
}