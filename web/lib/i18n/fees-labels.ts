// web/lib/i18n/fees-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface FeesLabels {
  pageTitle: string;
  termLabel: string;
  selectTerm: string;
  feeStructureHeading: (termName: string) => string;
  feeStructureHeadingGeneric: string;
  oneClass: string;
  allClasses: string;
  feeNamePlaceholder: string;
  amountPlaceholder: (currency: string) => string;
  addBtn: string;
  couldNotAddFeeItem: string;
  generateInvoicesBtn: string;
  invoicesGeneratedNotice: (count: number) => string;
  couldNotGenerateInvoices: string;
  invoicesHeading: (count: number) => string;
  exportToExcelBtn: string;
  cashAmountPlaceholder: (currency: string) => string;
  recordCashBtn: string;
  recordTransferBtn: string;
  statusPending: string;
  statusPartiallyPaid: string;
  statusPaid: string;
  matchTransferHeading: string;
  matchTransferHelp: string;
  narrationPlaceholder: string;
  findMatchesBtn: string;
  owes: (money: string) => string;
  matchPercent: (percent: number) => string;
  debtorsHeading: string;
  noOutstandingBalances: string;
}

const EN: FeesLabels = {
  pageTitle: 'Fees',
  termLabel: 'Term',
  selectTerm: 'Select a term',
  feeStructureHeading: () => 'Fee structure for this term',
  feeStructureHeadingGeneric: 'Fee structure for this term',
  oneClass: '(one class)',
  allClasses: '(all classes)',
  feeNamePlaceholder: 'Fee name e.g. Tuition',
  amountPlaceholder: (currency) => `Amount (${currency})`,
  addBtn: 'Add',
  couldNotAddFeeItem: 'Could not add fee item',
  generateInvoicesBtn: 'Generate invoices for all active students this term',
  invoicesGeneratedNotice: (count) => `Generated ${count} new invoice(s).`,
  couldNotGenerateInvoices: 'Could not generate invoices',
  invoicesHeading: (count) => `Invoices (${count})`,
  exportToExcelBtn: 'Export to Excel',
  cashAmountPlaceholder: (currency) => `${currency} amount`,
  recordCashBtn: 'Record cash',
  recordTransferBtn: 'Record transfer',
  statusPending: 'PENDING',
  statusPartiallyPaid: 'PARTIALLY PAID',
  statusPaid: 'PAID',
  matchTransferHeading: 'Match a bank transfer',
  matchTransferHelp: "Paste the narration from your bank alert — we'll suggest which invoice it likely pays.",
  narrationPlaceholder: 'e.g. Transfer from Chioma Balogun',
  findMatchesBtn: 'Find matches',
  owes: (money) => `owes ${money}`,
  matchPercent: (percent) => `${percent}% match`,
  debtorsHeading: 'Debtors',
  noOutstandingBalances: 'No outstanding balances.',
};

const FR: FeesLabels = {
  pageTitle: 'Frais scolaires',
  termLabel: 'Trimestre',
  selectTerm: 'Sélectionner un trimestre',
  feeStructureHeading: () => 'Structure des frais pour ce trimestre',
  feeStructureHeadingGeneric: 'Structure des frais pour ce trimestre',
  oneClass: '(une classe)',
  allClasses: '(toutes les classes)',
  feeNamePlaceholder: 'Nom des frais, ex. Scolarité',
  amountPlaceholder: (currency) => `Montant (${currency})`,
  addBtn: 'Ajouter',
  couldNotAddFeeItem: "Impossible d'ajouter cet élément de frais",
  generateInvoicesBtn: 'Générer les factures pour tous les élèves actifs ce trimestre',
  invoicesGeneratedNotice: (count) => `${count} nouvelle(s) facture(s) générée(s).`,
  couldNotGenerateInvoices: 'Impossible de générer les factures',
  invoicesHeading: (count) => `Factures (${count})`,
  exportToExcelBtn: 'Exporter vers Excel',
  cashAmountPlaceholder: (currency) => `Montant en ${currency}`,
  recordCashBtn: 'Enregistrer en espèces',
  recordTransferBtn: 'Enregistrer un virement',
  statusPending: 'EN ATTENTE',
  statusPartiallyPaid: 'PARTIELLEMENT PAYÉ',
  statusPaid: 'PAYÉ',
  matchTransferHeading: 'Faire correspondre un virement bancaire',
  matchTransferHelp: "Collez le libellé de votre alerte bancaire — nous suggérerons quelle facture il règle probablement.",
  narrationPlaceholder: 'ex. Virement de Chioma Balogun',
  findMatchesBtn: 'Rechercher des correspondances',
  owes: (money) => `doit ${money}`,
  matchPercent: (percent) => `${percent}% de correspondance`,
  debtorsHeading: 'Débiteurs',
  noOutstandingBalances: 'Aucun solde impayé.',
};

const FEES_LABELS_BY_LOCALE: Record<SupportedLocale, FeesLabels> = { en: EN, fr: FR };

export function feesLabelsFor(locale: string): FeesLabels {
  return FEES_LABELS_BY_LOCALE[locale as SupportedLocale] ?? FEES_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
