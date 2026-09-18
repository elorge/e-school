// web/lib/endpoints/payroll.ts
import { apiFetch, getToken } from '../api';
import type { SalaryLineItem } from './staff';

export type PayrollRunStatus = 'DRAFT' | 'APPROVED' | 'PAID' | 'CANCELLED';
export type PayslipStatus = 'PENDING' | 'PAID';

export interface Payslip {
  id: string;
  payrollRunId: string;
  staffProfileId: string;
  userId: string;
  baseSalaryKobo: number;
  allowancesKobo: number;
  deductionsKobo: number;
  grossKobo: number;
  netKobo: number;
  currency: string;
  breakdown: { allowances: SalaryLineItem[]; deductions: SalaryLineItem[] };
  status: PayslipStatus;
  paidAt: string | null;
  paymentReference: string | null;
  createdAt: string;
  user?: { id: string; fullName: string; email: string };
  staffProfile?: { staffId: string; department: string | null; designation: string | null };
  payrollRun?: { periodLabel: string; periodStart: string; periodEnd: string; status: PayrollRunStatus };
}

export interface PayrollRun {
  id: string;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  status: PayrollRunStatus;
  totalGrossKobo: number;
  totalDeductionsKobo: number;
  totalNetKobo: number;
  createdAt: string;
  approvedAt: string | null;
  payslips?: Payslip[];
}

export function generatePayrollRun(school: string, body: { periodLabel: string; periodStart: string; periodEnd: string }): Promise<PayrollRun> {
  return apiFetch(`/${school}/payroll/runs`, { method: 'POST', body: JSON.stringify(body) });
}

export function listPayrollRuns(school: string): Promise<PayrollRun[]> {
  return apiFetch(`/${school}/payroll/runs`);
}

export function getPayrollRun(school: string, id: string): Promise<PayrollRun> {
  return apiFetch(`/${school}/payroll/runs/${id}`);
}

export function approvePayrollRun(school: string, id: string): Promise<PayrollRun> {
  return apiFetch(`/${school}/payroll/runs/${id}/approve`, { method: 'POST' });
}

export function deletePayrollRun(school: string, id: string): Promise<{ deleted: boolean }> {
  return apiFetch(`/${school}/payroll/runs/${id}`, { method: 'DELETE' });
}

export function markPayslipPaid(school: string, payslipId: string, paymentReference?: string): Promise<Payslip> {
  return apiFetch(`/${school}/payroll/payslips/${payslipId}/pay`, { method: 'POST', body: JSON.stringify({ paymentReference }) });
}

export function listMyPayslips(school: string): Promise<Payslip[]> {
  return apiFetch(`/${school}/payroll/payslips/me`);
}

export interface DisbursementScheduleRow {
  payslipId: string;
  staffId: string;
  fullName: string;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  amountMajor: number;
  currency: string;
  narration: string;
}

export function getDisbursementSchedule(
  school: string,
  runId: string,
): Promise<{ rows: DisbursementScheduleRow[]; missingBankDetails: { fullName: string; staffId: string }[] }> {
  return apiFetch(`/${school}/payroll/runs/${runId}/schedule`);
}

export async function downloadDisbursementScheduleCsv(school: string, runId: string): Promise<Blob> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const token = getToken();
  const res = await fetch(`${API_URL}/${school}/payroll/runs/${runId}/schedule.csv`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error('Download failed');
  return res.blob();
}

export async function downloadPayslipPdf(school: string, payslipId: string): Promise<Blob> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const token = getToken();
  const res = await fetch(`${API_URL}/${school}/payroll/payslips/${payslipId}/pdf`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error('Download failed');
  return res.blob();
}
