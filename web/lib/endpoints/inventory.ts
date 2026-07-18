// web/lib/endpoints/inventory.ts
import { apiFetch } from '../api';

export interface InventoryItem {
  id: string;
  name: string;
  category: string | null;
  unit: string;
  quantityOnHand: number;
  reorderLevel: number;
  unitCostKobo: number;
}

export function listItems(school: string): Promise<InventoryItem[]> {
  return apiFetch(`/${school}/inventory/items`);
}

export function listLowStock(school: string): Promise<InventoryItem[]> {
  return apiFetch(`/${school}/inventory/items/low-stock`);
}

export function createItem(
  school: string,
  body: { name: string; category?: string; unit?: string; reorderLevel?: number; unitCostKobo?: number },
): Promise<InventoryItem> {
  return apiFetch(`/${school}/inventory/items`, { method: 'POST', body: JSON.stringify(body) });
}

export function recordTransaction(school: string, itemId: string, type: 'STOCK_IN' | 'STOCK_OUT', quantity: number, note?: string) {
  return apiFetch<InventoryItem>(`/${school}/inventory/items/${itemId}/transactions`, {
    method: 'POST',
    body: JSON.stringify({ type, quantity, note }),
  });
}

export interface InventoryTransaction {
  id: string;
  type: 'STOCK_IN' | 'STOCK_OUT';
  quantity: number;
  note: string | null;
  createdAt: string;
  item: { name: string; unit: string };
  recordedBy: { fullName: string };
}

export function listTransactions(school: string): Promise<InventoryTransaction[]> {
  return apiFetch(`/${school}/inventory/transactions`);
}

export async function downloadInventoryExcel(school: string): Promise<Blob> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const { getToken } = await import('../api');
  const token = getToken();
  const res = await fetch(`${API_URL}/${school}/inventory/export`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Export failed');
  return res.blob();
}