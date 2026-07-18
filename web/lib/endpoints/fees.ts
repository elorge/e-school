// web/lib/endpoints/fees.ts
import { apiFetch } from '../api';

export interface FeeStructure {
  id: string;
  termId: string;
  classId: string | null;
  name: string;
  amountKobo: number;
}

export interface FeeInvoice {
  id: string;
  studentId: string;
  termId: string;
  totalKobo: number;
  paidKobo: number;
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
  student?: { firstName: string; lastName: string; studentId: string | null };
}

export function createFeeStructure(school: string, body: { termId: string; classId?: string; name: string; amountKobo: number }) {
  return apiFetch<FeeStructure>(`/${school}/fees/structures`, { method: 'POST', body: JSON.stringify(body) });
}

export function listFeeStructures(school: string, termId?: string): Promise<FeeStructure[]> {
  const qs = termId ? `?termId=${termId}` : '';
  return apiFetch(`/${school}/fees/structures${qs}`);
}

export function generateInvoices(school: string, termId: string, classId?: string) {
  return apiFetch<{ created: number }>(`/${school}/fees/invoices/generate`, {
    method: 'POST',
    body: JSON.stringify({ termId, classId }),
  });
}

export function listInvoices(school: string, termId?: string, status?: string): Promise<FeeInvoice[]> {
  const params = new URLSearchParams();
  if (termId) params.set('termId', termId);
  if (status) params.set('status', status);
  const qs = params.toString();
  return apiFetch(`/${school}/fees/invoices${qs ? `?${qs}` : ''}`);
}

export function recordPayment(school: string, invoiceId: string, amountKobo: number, method: 'CASH' | 'BANK_TRANSFER' | 'CARD') {
  return apiFetch<FeeInvoice>(`/${school}/fees/invoices/${invoiceId}/payments`, {
    method: 'POST',
    body: JSON.stringify({ amountKobo, method }),
  });
}

export function getDebtors(school: string, termId: string) {
  return apiFetch<{ student: { firstName: string; lastName: string; studentId: string | null }; totalKobo: number; paidKobo: number; outstandingKobo: number }[]>(
    `/${school}/fees/debtors?termId=${termId}`,
  ); 
}

export async function downloadInvoicesExcel(school: string, termId?: string): Promise<Blob> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const { getToken } = await import('../api');
  const token = getToken();
  const qs = termId ? `?termId=${termId}` : '';
  const res = await fetch(`${API_URL}/${school}/fees/invoices/export${qs}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Export failed');
  return res.blob();
}