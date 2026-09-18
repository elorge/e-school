// backend/prisma/seed.ts
import { PrismaClient, Role, StudentStatus, LedgerType, LedgerSource, LedgerStatus, FeePaymentMethod } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { SUBJECT_CAREER_FIELDS } from '../src/common/constants';
import { timezoneForCountry } from '../src/common/utils/timezone.util';
import { localeForCountry } from '../src/common/utils/locale.util';

const prisma = new PrismaClient();

// ─── Global career-field defaults (schoolId: null) ─────────────────────────
// Seeds SubjectCareerField from the old hardcoded SUBJECT_CAREER_FIELDS
// constant, once. Every school sees these by default; a school outside
// Nigeria (or with a different curriculum) adds its OWN rows on top via
// POST /:school/career-fields — see CareerFieldsService.

async function seedGlobalCareerFields() {
  const existingCount = await prisma.subjectCareerField.count({ where: { schoolId: null } });
  if (existingCount > 0) {
    console.log('Global SubjectCareerField rows already seeded — skipping.');
    return;
  }

  const rows: { subject: string; field: string }[] = [];
  for (const [subject, fields] of Object.entries(SUBJECT_CAREER_FIELDS)) {
    for (const field of fields) rows.push({ subject, field });
  }

  await prisma.subjectCareerField.createMany({
    data: rows.map((r) => ({ schoolId: null, subject: r.subject, field: r.field })),
    skipDuplicates: true,
  });
  console.log(`Seeded ${rows.length} global subject-career-field mappings.`);
}

// ─── Super Admin (platform-wide) ───────────────────────────────────────────

async function seedSuperAdmin() {
  const email = process.env.SEED_SUPER_ADMIN_EMAIL ?? 'admin@elorgeschools.com';
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD ?? 'Admin1234!';
  const fullName = process.env.SEED_SUPER_ADMIN_NAME ?? 'Platform Super Admin';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`SUPER_ADMIN already exists (${email}) — skipping.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, fullName, role: Role.SUPER_ADMIN, schoolId: null },
  });

  console.log('Created SUPER_ADMIN:');
  console.log(`  email:    ${user.email}`);
  console.log(`  password: ${password}  (change this after first login)`);
}

// ─── Finance/Ops (platform-wide) ────────────────────────────────────────────

async function seedFinanceOps() {
  const email = process.env.SEED_FINANCE_OPS_EMAIL ?? 'finance@elorgeschools.com';
  const password = process.env.SEED_FINANCE_OPS_PASSWORD ?? 'Finance1234!';
  const fullName = process.env.SEED_FINANCE_OPS_NAME ?? 'Platform Finance Ops';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`FINANCE_OPS already exists (${email}) — skipping.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, fullName, role: Role.FINANCE_OPS, schoolId: null },
  });

  console.log('Created FINANCE_OPS:');
  console.log(`  email:    ${user.email}`);
  console.log(`  password: ${password}  (change this after first login)`);
}

// ─── Demo school + everything that lives inside it ──────────────────────────

async function seedDemoSchool() {
  const slug = 'greenwood-college';
  const existingSchool = await prisma.school.findUnique({ where: { slug } });
  if (existingSchool) {
    console.log(`Demo school "${slug}" already exists — skipping full re-seed.`);
    return;
  }

  const countryCode = 'NG';
  const school = await prisma.school.create({
    data: {
      slug,
      name: 'Greenwood College',
      code: 'GRW',
      countryCode,
      currency: 'NGN',
      // timezone has no DB default and is a required column — bypassing
      // SchoolsService.create() here (this is a direct prisma call) means
      // we have to derive it ourselves, the same way that service does,
      // or this create() throws "Argument `timezone` is missing" and the
      // whole demo school (students, wallet, everything below) never gets
      // seeded. locale DOES have a DB default ('en'), but it's set
      // explicitly too so this stays correct if that default ever changes
      // or a non-English-default country is used here later.
      timezone: timezoneForCountry(countryCode),
      locale: localeForCountry(countryCode),
      pricePerStudentKoboOverride: null, // uses platform default
      sessionWrapEnabled: true, // seeded ON so you can demo it immediately
    },
  });
  console.log(`Created school: ${school.name} (${school.slug}) — ${school.countryCode} / ${school.currency}`);

  // ── Users ──────────────────────────────────────────────────────────────
  const adminPasswordHash = await bcrypt.hash('SchoolAdmin1234!', 10);
  const admin = await prisma.user.create({
    data: {
      schoolId: school.id,
      role: Role.SCHOOL_ADMIN,
      email: 'admin@greenwood.edu.ng',
      passwordHash: adminPasswordHash,
      fullName: 'Grace Adeyemi',
    },
  });

  const teacherPasswordHash = await bcrypt.hash('Teacher1234!', 10);
  const teacher = await prisma.user.create({
    data: {
      schoolId: school.id,
      role: Role.STAFF,
      email: 'teacher@greenwood.edu.ng',
      passwordHash: teacherPasswordHash,
      fullName: 'Chidi Okafor',
    },
  });
  console.log('Created SCHOOL_ADMIN (admin@greenwood.edu.ng / SchoolAdmin1234!)');
  console.log('Created STAFF (teacher@greenwood.edu.ng / Teacher1234!)');

  // ── Class ──────────────────────────────────────────────────────────────
  const jss1 = await prisma.class.create({
    data: { schoolId: school.id, name: 'JSS 1', createdByStaffId: admin.id, classTeacherId: teacher.id },
  });
  console.log(`Created class: ${jss1.name}`);

  // ── Terms — one full academic session, three terms, so Session Wrap has real data ──
  const academicSession = '2025/2026';
  const term1 = await prisma.term.create({
    data: {
      schoolId: school.id,
      name: `${academicSession} — Term 1`,
      academicSession,
      termNumber: 1,
      startDate: new Date('2025-09-08'),
      endDate: new Date('2025-12-12'),
    },
  });
  const term2 = await prisma.term.create({
    data: {
      schoolId: school.id,
      name: `${academicSession} — Term 2`,
      academicSession,
      termNumber: 2,
      startDate: new Date('2026-01-05'),
      endDate: new Date('2026-04-03'),
    },
  });
  const term3 = await prisma.term.create({
    data: {
      schoolId: school.id,
      name: `${academicSession} — Term 3`,
      academicSession,
      termNumber: 3,
      startDate: new Date('2026-04-27'),
      endDate: new Date('2026-07-24'),
    },
  });
  console.log(`Created 3 terms for session ${academicSession}`);

  // ── Students ───────────────────────────────────────────────────────────
  const studentSeeds = [
    { firstName: 'Adaeze', lastName: 'Nwosu' },
    { firstName: 'Tunde', lastName: 'Balogun' },
    { firstName: 'Fatima', lastName: 'Sule' },
  ];

  const students = [];
  for (let i = 0; i < studentSeeds.length; i++) {
    const s = studentSeeds[i];
    const student = await prisma.student.create({
      data: {
        schoolId: school.id,
        classId: jss1.id,
        clientReferenceId: randomUUID(),
        studentId: `GRW/2025/${String(i + 1).padStart(4, '0')}`,
        status: StudentStatus.ACTIVE,
        firstName: s.firstName,
        lastName: s.lastName,
        admissionYear: 2025,
        createdByStaffId: admin.id,
      },
    });
    students.push(student);
  }
  console.log(`Created ${students.length} students in ${jss1.name}`);

  // ── Results — terms 1 and 2 filled in, term 3 deliberately left empty so
  //    Session Wrap has a real "2 of 3 terms" partial case to demo ──────────
  const resultsByStudent: Record<string, { term1: Record<string, number>; term2: Record<string, number> }> = {
    [students[0].id]: {
      term1: { Mathematics: 88, English: 65, Chemistry: 72, Biology: 80 },
      term2: { Mathematics: 91, English: 68, Chemistry: 75, Biology: 84 },
    },
    [students[1].id]: {
      term1: { Mathematics: 54, English: 79, Government: 82, History: 76 },
      term2: { Mathematics: 58, English: 81, Government: 85, History: 74 },
    },
    [students[2].id]: {
      term1: { Mathematics: 73, English: 70, Chemistry: 45, Biology: 60 },
      term2: { Mathematics: 77, English: 74, Chemistry: 49, Biology: 63 },
    },
  };

  for (const student of students) {
    const scores = resultsByStudent[student.id];
    await prisma.resultEntry.create({
      data: {
        schoolId: school.id,
        studentId: student.id,
        termId: term1.id,
        subjectScores: scores.term1,
        teacherComment: 'Good start to the session.',
        classTeacherId: teacher.id,
      },
    });
    await prisma.resultEntry.create({
      data: {
        schoolId: school.id,
        studentId: student.id,
        termId: term2.id,
        subjectScores: scores.term2,
        teacherComment: 'Consistent improvement this term.',
        classTeacherId: teacher.id,
      },
    });
  }
  console.log('Created Term 1 + Term 2 results for every student (Term 3 left empty on purpose)');

  // ── Wallet — a welcome-bonus-style credit so PIN/CBT features are testable immediately ──
  await prisma.walletLedgerEntry.create({
    data: {
      schoolId: school.id,
      type: LedgerType.CREDIT,
      amountKobo: 10_000_000, // ₦100,000 — school.currency is NGN, so this is literally kobo here
      currency: school.currency,
      source: LedgerSource.PROMO,
      status: LedgerStatus.CONFIRMED,
      reference: `welcome-bonus-${school.id}`,
    },
  });
  console.log('Credited wallet with ₦100,000 seed balance');

  // ── Fees ───────────────────────────────────────────────────────────────
  const tuitionFee = await prisma.feeStructure.create({
    data: { schoolId: school.id, termId: term1.id, classId: null, name: 'Tuition', amountKobo: 15_000_000 }, // ₦150,000
  });
  const booksFee = await prisma.feeStructure.create({
    data: { schoolId: school.id, termId: term1.id, classId: jss1.id, name: 'Books', amountKobo: 1_500_000 }, // ₦15,000
  });
  console.log(`Created fee structure: ${tuitionFee.name} + ${booksFee.name} for Term 1`);

  for (const student of students) {
    const totalKobo = tuitionFee.amountKobo + booksFee.amountKobo;
    const invoice = await prisma.feeInvoice.create({
      data: { schoolId: school.id, studentId: student.id, termId: term1.id, totalKobo, paidKobo: 0, status: 'UNPAID' },
    });

    // First student is fully paid, second is partially paid, third is unpaid —
    // gives you a real spread to demo the Debtors view immediately.
    if (student === students[0]) {
      await prisma.feePayment.create({
        data: {
          schoolId: school.id,
          invoiceId: invoice.id,
          amountKobo: totalKobo,
          method: FeePaymentMethod.BANK_TRANSFER,
          reference: `seed-fee-${invoice.id}-1`,
          recordedById: admin.id,
        },
      });
      await prisma.feeInvoice.update({ where: { id: invoice.id }, data: { paidKobo: totalKobo, status: 'PAID' } });
    } else if (student === students[1]) {
      const partial = Math.round(totalKobo / 2);
      await prisma.feePayment.create({
        data: {
          schoolId: school.id,
          invoiceId: invoice.id,
          amountKobo: partial,
          method: FeePaymentMethod.CASH,
          reference: `seed-fee-${invoice.id}-1`,
          recordedById: admin.id,
        },
      });
      await prisma.feeInvoice.update({ where: { id: invoice.id }, data: { paidKobo: partial, status: 'PARTIALLY_PAID' } });
    }
    // students[2] stays UNPAID — the debtor case
  }
  console.log('Created Term 1 invoices: 1 fully paid, 1 partially paid, 1 unpaid');

  // ── Inventory ──────────────────────────────────────────────────────────
  await prisma.inventoryItem.create({
    data: { schoolId: school.id, name: 'Exercise books', category: 'Consumables', unit: 'pcs', quantityOnHand: 200, reorderLevel: 50, unitCostKobo: 25_000 },
  });
  await prisma.inventoryItem.create({
    data: { schoolId: school.id, name: 'Desktop computers', category: 'IT Equipment', unit: 'pcs', quantityOnHand: 8, reorderLevel: 10, unitCostKobo: 15_000_000 },
  });
  console.log('Created inventory items (desktop computers seeded BELOW reorder level, to demo the low-stock view)');

  console.log(`\nDemo school ready — sign in at /${slug}/admin or /${slug}/staff`);
  console.log('  School Admin: admin@greenwood.edu.ng / SchoolAdmin1234!');
  console.log('  Staff:        teacher@greenwood.edu.ng / Teacher1234!');
}

// ─── Run all seeds ──────────────────────────────────────────────────────────

async function main() {
  await seedGlobalCareerFields();
  await seedSuperAdmin();
  await seedFinanceOps();
  await seedDemoSchool();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });