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