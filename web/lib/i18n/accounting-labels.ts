// web/lib/i18n/accounting-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface AccountingLabels {
  pageTitle: string;
  loadFailed: string;
  fromLabel: string;
  toLabel: string;
  incomeLabel: string;
  expensesLabel: string;
  netLabel: string;
  expensesByCategoryHeading: string;
  recordExpenseHeading: string;
  categoryPlaceholder: string;
  descriptionPlaceholder: string;
  amountPlaceholder: (currency: string) => string;
  recordBtn: string;
  couldNotRecordExpense: string;
  recentExpensesHeading: string;
  exportToExcelBtn: string;
}

const EN: AccountingLabels = {
  pageTitle: 'Accounting',
  loadFailed: 'Failed to load accounting data',
  fromLabel: 'From',
  toLabel: 'To',
  incomeLabel: 'Income (fee payments)',
  expensesLabel: 'Expenses',
  netLabel: 'Net',
  expensesByCategoryHeading: 'Expenses by category',
  recordExpenseHeading: 'Record an expense',
  categoryPlaceholder: 'Category e.g. Salaries',
  descriptionPlaceholder: 'Description',
  amountPlaceholder: (currency) => `Amount (${currency})`,
  recordBtn: 'Record',
  couldNotRecordExpense: 'Could not record expense',
  recentExpensesHeading: 'Recent expenses',
  exportToExcelBtn: 'Export to Excel',
};

const FR: AccountingLabels = {
  pageTitle: 'Comptabilité',
  loadFailed: 'Échec du chargement des données comptables',
  fromLabel: 'Du',
  toLabel: 'Au',
  incomeLabel: 'Revenus (paiements de frais)',
  expensesLabel: 'Dépenses',
  netLabel: 'Net',
  expensesByCategoryHeading: 'Dépenses par catégorie',
  recordExpenseHeading: 'Enregistrer une dépense',
  categoryPlaceholder: 'Catégorie, ex. Salaires',
  descriptionPlaceholder: 'Description',
  amountPlaceholder: (currency) => `Montant (${currency})`,
  recordBtn: 'Enregistrer',
  couldNotRecordExpense: "Impossible d'enregistrer la dépense",
  recentExpensesHeading: 'Dépenses récentes',
  exportToExcelBtn: 'Exporter vers Excel',
};

const ACCOUNTING_LABELS_BY_LOCALE: Record<SupportedLocale, AccountingLabels> = {
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

export function accountingLabelsFor(locale: string): AccountingLabels {
  return ACCOUNTING_LABELS_BY_LOCALE[locale as SupportedLocale] ?? ACCOUNTING_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
