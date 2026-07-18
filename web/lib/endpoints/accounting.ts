// web/lib/endpoints/accounting.ts
import { apiFetch } from '../api';

export interface ExpenseEntry {
  id: string;
  category: string;
  description: string;
  amountKobo: number;
  incurredAt: string;
}

export interface IncomeExpenditureSummary {
  from: string;
  to: string;
  totalIncomeKobo: number;
  totalExpenseKobo: number;
  netKobo: number;
  expenseByCategory: Record<string, number>;
}

export function recordExpense(
  school: string,
  body: { category: string; description: string; amountKobo: number; incurredAt: string },
): Promise<ExpenseEntry> {
  return apiFetch(`/${school}/accounting/expenses`, { method: 'POST', body: JSON.stringify(body) });
}

export function listExpenses(school: string, from?: string, to?: string): Promise<ExpenseEntry[]> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();
  return apiFetch(`/${school}/accounting/expenses${qs ? `?${qs}` : ''}`);
}

export function getSummary(school: string, from: string, to: string): Promise<IncomeExpenditureSummary> {
  return apiFetch(`/${school}/accounting/summary?from=${from}&to=${to}`);
}

export async function downloadAccountingExcel(school: string, from: string, to: string): Promise<Blob> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const { getToken } = await import('../api');
  const token = getToken();
  const res = await fetch(`${API_URL}/${school}/accounting/export?from=${from}&to=${to}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Export failed');
  return res.blob();
}