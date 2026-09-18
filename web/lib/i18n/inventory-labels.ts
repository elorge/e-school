// web/lib/i18n/inventory-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface InventoryLabels {
  pageTitle: string;
  lowStockHeading: string;
  leftUnit: (name: string, qty: number, unit: string, reorderLevel: number) => string;
  addItemHeading: string;
  namePlaceholder: string;
  categoryPlaceholder: string;
  unitPlaceholder: string;
  reorderAtPlaceholder: string;
  addBtn: string;
  couldNotCreateItem: string;
  allItemsHeading: string;
  onHand: (qty: number, unit: string) => string;
  perUnit: (money: string, unit: string) => string;
  qtyPlaceholder: string;
  stockInBtn: string;
  stockOutBtn: string;
  couldNotRecordTransaction: string;
  recentTransactionsHeading: string;
  exportToExcelBtn: string;
  noTransactionsYet: string;
  colDate: string;
  colItem: string;
  colType: string;
  colQty: string;
  colBy: string;
  typeIn: string;
  typeOut: string;
}

const EN: InventoryLabels = {
  pageTitle: 'Inventory',
  lowStockHeading: 'Low stock',
  leftUnit: (name, qty, unit, reorderLevel) => `${name} — ${qty} ${unit} left (reorder at ${reorderLevel})`,
  addItemHeading: 'Add an item',
  namePlaceholder: 'Name',
  categoryPlaceholder: 'Category',
  unitPlaceholder: 'Unit',
  reorderAtPlaceholder: 'Reorder at',
  addBtn: 'Add',
  couldNotCreateItem: 'Could not create item',
  allItemsHeading: 'All items',
  onHand: (qty, unit) => `${qty} ${unit} on hand`,
  perUnit: (money, unit) => `(${money} / ${unit})`,
  qtyPlaceholder: 'Qty',
  stockInBtn: 'Stock in',
  stockOutBtn: 'Stock out',
  couldNotRecordTransaction: 'Could not record transaction — check stock levels',
  recentTransactionsHeading: 'Recent transactions',
  exportToExcelBtn: 'Export to Excel',
  noTransactionsYet: 'No transactions recorded yet.',
  colDate: 'Date',
  colItem: 'Item',
  colType: 'Type',
  colQty: 'Qty',
  colBy: 'By',
  typeIn: 'In',
  typeOut: 'Out',
};

const FR: InventoryLabels = {
  pageTitle: 'Inventaire',
  lowStockHeading: 'Stock faible',
  leftUnit: (name, qty, unit, reorderLevel) => `${name} — ${qty} ${unit} restant(s) (réapprovisionner à ${reorderLevel})`,
  addItemHeading: 'Ajouter un article',
  namePlaceholder: 'Nom',
  categoryPlaceholder: 'Catégorie',
  unitPlaceholder: 'Unité',
  reorderAtPlaceholder: 'Réapprovisionner à',
  addBtn: 'Ajouter',
  couldNotCreateItem: "Impossible de créer l'article",
  allItemsHeading: 'Tous les articles',
  onHand: (qty, unit) => `${qty} ${unit} en stock`,
  perUnit: (money, unit) => `(${money} / ${unit})`,
  qtyPlaceholder: 'Qté',
  stockInBtn: 'Entrée de stock',
  stockOutBtn: 'Sortie de stock',
  couldNotRecordTransaction: "Impossible d'enregistrer la transaction — vérifiez les niveaux de stock",
  recentTransactionsHeading: 'Transactions récentes',
  exportToExcelBtn: 'Exporter vers Excel',
  noTransactionsYet: 'Aucune transaction enregistrée pour le moment.',
  colDate: 'Date',
  colItem: 'Article',
  colType: 'Type',
  colQty: 'Qté',
  colBy: 'Par',
  typeIn: 'Entrée',
  typeOut: 'Sortie',
};

const INVENTORY_LABELS_BY_LOCALE: Record<SupportedLocale, InventoryLabels> = {
  en: EN,
  fr: FR,
  // TODO: translate to Portuguese. Falls back to English for now so
  // Portuguese-speaking schools (e.g. Mozambique, Angola) get a
  // working, correctly-worded product immediately rather than a
  // rushed/incorrect machine translation of operational and
  // financial terminology. Prioritize replacing this over the
  // already-translated marketing/legal/nav/footer/login/report-card
  // strings, which speak to prospective customers and parents first.
  pt: EN,
};

export function inventoryLabelsFor(locale: string): InventoryLabels {
  return INVENTORY_LABELS_BY_LOCALE[locale as SupportedLocale] ?? INVENTORY_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
