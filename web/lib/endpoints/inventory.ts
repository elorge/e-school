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