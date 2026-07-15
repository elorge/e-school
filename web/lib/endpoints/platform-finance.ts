// web/lib/endpoints/platform-finance.ts
import { apiFetch } from '../api';

export interface PlatformOverview {
  revenueThisMonthKobo: number;
  expensesThisMonthKobo: number;
  netThisMonthKobo: number;
  totalSchools: number;
  activeSchools: number;
  suspendedSchools: number;
  pendingTransfers: number;
}

export interface PlatformExpense {
  id: string;
  category: string;
  description: string;
  amountKobo: number;
  incurredAt: string;
}

export function getOverview(): Promise<PlatformOverview> {
  return apiFetch('/platform/finance/overview');
}

export function recordPlatformExpense(body: { category: string; description: string; amountKobo: number; incurredAt: string }) {
  return apiFetch<PlatformExpense>('/platform/finance/expenses', { method: 'POST', body: JSON.stringify(body) });
}

export function listPlatformExpenses(): Promise<PlatformExpense[]> {
  return apiFetch('/platform/finance/expenses');
}

export async function downloadExpensesExcel(from?: string, to?: string): Promise<Blob> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const { getToken } = await import('../api');
  const token = getToken();
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const res = await fetch(`${API_URL}/platform/finance/expenses/export?${params.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Export failed');
  return res.blob();
}