// web/app/[school]/admin/inventory/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import LoadingScreen from '@/components/LoadingScreen';
import { Boxes } from 'lucide-react';
import { listItems, listLowStock, createItem, recordTransaction, listTransactions, downloadInventoryExcel, type InventoryTransaction, type InventoryItem } from '@/lib/endpoints/inventory';
import { inventoryLabelsFor } from '@/lib/i18n/inventory-labels';
import RequireRole from '@/components/RequireRole';
import { Download } from 'lucide-react';
import { formatMoney } from '@/lib/currency';

export default function InventoryPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const t = inventoryLabelsFor(school.locale);
  const money = (kobo: number) => formatMoney(kobo, school.currency, school.locale);
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [lowStock, setLowStock] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', category: '', unit: 'pcs', reorderLevel: 0, unitCostKobo: 0 });

  async function load() {
    try {
      setItems(await listItems(params.school));
      setLowStock(await listLowStock(params.school));
      setTransactions(await listTransactions(params.school));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createItem(params.school, form);
      setForm({ name: '', category: '', unit: 'pcs', reorderLevel: 0, unitCostKobo: 0 });
      load();
    } catch {
      setError(t.couldNotCreateItem);
    }
  }

  async function handleTx(itemId: string, type: 'STOCK_IN' | 'STOCK_OUT', qtyStr: string) {
    const quantity = Number(qtyStr);
    if (!quantity) return;
    try {
      await recordTransaction(params.school, itemId, type, quantity);
      load();
    } catch {
      setError(t.couldNotRecordTransaction);
    }
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <RequireRole allow={['SCHOOL_ADMIN']}>
    <main className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold"><Boxes size={20} />{school.name} — {t.pageTitle}</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {lowStock.length > 0 && (
        <section className="rounded-lg border border-amber bg-amber/10 p-4">
          <h2 className="mb-2 font-medium text-amber">{t.lowStockHeading}</h2>
          <ul className="text-sm">
            {lowStock.map((i) => (
              <li key={i.id}>{t.leftUnit(i.name, i.quantityOnHand, i.unit, i.reorderLevel)}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="card">
        <h2 className="mb-3 font-medium">{t.addItemHeading}</h2>
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-2">
          <input
            className="rounded border px-2 py-1.5 text-sm"
            placeholder={t.namePlaceholder}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            className="rounded border px-2 py-1.5 text-sm"
            placeholder={t.categoryPlaceholder}
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          />
          <input
            className="w-20 rounded border px-2 py-1.5 text-sm"
            placeholder={t.unitPlaceholder}
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
          />
          <input
            className="w-24 rounded border px-2 py-1.5 text-sm"
            type="number"
            placeholder={t.reorderAtPlaceholder}
            onChange={(e) => setForm((f) => ({ ...f, reorderLevel: Number(e.target.value) }))}
          />
          <button type="submit" className="rounded bg-brand-blue px-3 py-1.5 text-sm text-white">
            {t.addBtn}
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="mb-3 font-medium">{t.allItemsHeading}</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {items.map((i) => (
            <li key={i.id} className="flex items-center justify-between border-b pb-2">
              <span>
                {i.name} — {t.onHand(i.quantityOnHand, i.unit)}
                <span className="ml-2 text-xs text-ink/40">{t.perUnit(money(i.unitCostKobo), i.unit)}</span>
              </span>
              <div className="flex items-center gap-2">
                <input className="w-16 rounded border px-2 py-1 text-xs" type="number" id={`qty-${i.id}`} placeholder={t.qtyPlaceholder} />
                <button
                  className="text-xs text-brand-green underline"
                  onClick={() => {
                    const input = document.getElementById(`qty-${i.id}`) as HTMLInputElement;
                    if (input?.value) handleTx(i.id, 'STOCK_IN', input.value);
                    if (input) input.value = '';
                  }}
                >
                  {t.stockInBtn}
                </button>
                <button
                  className="text-xs text-red-600 underline"
                  onClick={() => {
                    const input = document.getElementById(`qty-${i.id}`) as HTMLInputElement;
                    if (input?.value) handleTx(i.id, 'STOCK_OUT', input.value);
                    if (input) input.value = '';
                  }}
                >
                  {t.stockOutBtn}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">{t.recentTransactionsHeading}</h2>
          <button
            onClick={async () => {
              const blob = await downloadInventoryExcel(params.school);
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'inventory.xlsx';
              a.click();
            }}
            className="btn-secondary flex items-center gap-1.5 text-xs"
          >
            <Download size={14} /> {t.exportToExcelBtn}
          </button>
        </div>
        {transactions.length === 0 ? (
          <p className="text-sm text-ink/40">{t.noTransactionsYet}</p>
        ) : (
          <div className="max-h-72 overflow-y-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-black/5 text-xs text-ink/50">
                <tr>
                  <th className="px-3 py-2 text-left">{t.colDate}</th>
                  <th className="px-3 py-2 text-left">{t.colItem}</th>
                  <th className="px-3 py-2 text-left">{t.colType}</th>
                  <th className="px-3 py-2 text-right">{t.colQty}</th>
                  <th className="px-3 py-2 text-left">{t.colBy}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-t">
                    <td className="px-3 py-2 text-ink/60">{tx.createdAt.slice(0, 10)}</td>
                    <td className="px-3 py-2">{tx.item.name}</td>
                    <td className="px-3 py-2">
                      <span className={`badge ${tx.type === 'STOCK_IN' ? 'badge-green' : 'badge-red'}`}>{tx.type === 'STOCK_IN' ? t.typeIn : t.typeOut}</span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {tx.quantity} {tx.item.unit}
                    </td>
                    <td className="px-3 py-2 text-ink/60">{tx.recordedBy.fullName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  </RequireRole>
);
}
