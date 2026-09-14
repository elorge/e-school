// web/lib/types.ts
// Mirrors backend/prisma/schema.prisma enums and shapes the UI needs.
// Keep in sync manually — no shared package between web/ and backend/ yet.

export type Role = 'SUPER_ADMIN' | 'FINANCE_OPS' | 'SCHOOL_ADMIN' | 'STAFF';

export type StudentStatus = 'PENDING_ID' | 'ACTIVE' | 'WITHDRAWN';

export type PinStatus = 'ACTIVE' | 'INVALIDATED';

export type LedgerType = 'CREDIT' | 'DEBIT';
export type LedgerSource = 'GATEWAY' | 'MANUAL_TRANSFER' | 'DVA' | 'PROMO' | 'SYSTEM' | 'REFUND' | 'ADMIN_CREDIT';
export type LedgerStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

export type CalendarEventType =
  | 'TERM_START'
  | 'TERM_END'
  | 'MIDTERM_BREAK'
  | 'EXAM_PERIOD'
  | 'RESUMPTION'
  | 'PTA_MEETING'
  | 'HOLIDAY'
  | 'CUSTOM';

export interface User {
  id: string;
  schoolId: string | null;
  role: Role;
  email: string;
  fullName: string;
  createdAt: string;
}

export type SchoolStatus = 'ACTIVE' | 'SUSPENDED';

export interface School {
  id: string;
  slug: string;
  name: string;
  code: string;
  logoUrl: string | null;
  signatureUrl: string | null;
  info: Record<string, unknown> | null;
  countryCode: string; // ISO 3166-1 alpha-2, e.g. "NG"
  currency: string; // ISO 4217, e.g. "NGN" — every *Kobo field below is a minor unit of THIS currency for this school
  timezone: string; // IANA name, e.g. "Africa/Lagos" — drives CBT access-code day validity
  locale: string; // ISO 639-1, e.g. "en", "fr" — see lib/locale.ts. Drives report card labels, CBT UI copy, and system emails.
  pricePerStudentKoboOverride: number | null;
  sessionWrapEnabled: boolean;
  status: SchoolStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  schoolId: string;
  name: string;
  createdByStaffId: string;
  classTeacherId: string | null;
  createdAt: string;
  students?: Student[];
}

export interface Student {
  id: string;
  schoolId: string;
  classId: string;
  studentId: string | null;
  clientReferenceId: string | null;
  status: StudentStatus;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  admissionYear: number;
  createdByStaffId: string;
  createdAt: string;
}

export interface Term {
  id: string;
  schoolId: string;
  name: string;
  academicSession: string;
  termNumber: number;
  startDate: string;
  endDate: string;
}

export interface ResultEntry {
  id: string;
  schoolId: string;
  studentId: string;
  termId: string;
  subjectScores: Record<string, number>;
  teacherComment: string | null;
  classTeacherId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  schoolId: string;
  termId: string | null;
  type: CalendarEventType;
  title: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
}

export interface WalletLedgerEntry {
  id: string;
  schoolId: string;
  type: LedgerType;
  amountKobo: number;
  currency: string; // ISO 4217 — stamped at creation from the school's currency, so a ledger row is self-describing
  source: LedgerSource;
  status: LedgerStatus;
  reference: string;
  approvedById: string | null;
  idempotencyKey: string | null;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: Role;
    schoolId: string | null;
    schoolSlug: string | null;
    mustChangePassword: boolean;
  };
}