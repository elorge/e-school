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