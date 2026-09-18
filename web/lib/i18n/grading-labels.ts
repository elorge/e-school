// web/lib/i18n/grading-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface GradingLabels {
  pageTitle: string;
  description: string;
  selectClass: string;
  allSubjectsClassDefault: string;
  allTermsDefault: string;
  coveragePrefix: (subjectSuffix: string) => string;
  allSubjectsClassDefaultSuffix: string;
  levelTermSubject: string;
  levelSubjectDefault: string;
  levelTermClasswide: string;
  levelClassDefault: string;
  levelUnweighted: string;
  componentNamePlaceholder: string;
  addComponentBtn: string;
  totalLabel: (total: number) => string;
  saveWeightingBtn: string;
  weightsSumError: (total: number) => string;
  confirmNoWiderDefault: string;
  savedNotice: string;
  saveError: string;
}

const EN: GradingLabels = {
  pageTitle: 'Grading Weights',
  description: "Decide how much of a subject's final score comes from Test vs Exam (or any breakdown you want). Leave a term unselected to set a default that applies to every term, then override individual terms as needed — same idea as leaving a subject unselected to set a class-wide default.",
  selectClass: 'Select a class',
  allSubjectsClassDefault: 'All subjects (class default)',
  allTermsDefault: 'All terms (default)',
  coveragePrefix: (subjectSuffix) => `COVERAGE ${subjectSuffix}`,
  allSubjectsClassDefaultSuffix: '— all subjects (class default)',
  levelTermSubject: 'Configured for this term',
  levelSubjectDefault: "Using this subject\u2019s default",
  levelTermClasswide: "Using this term\u2019s class-wide weights",
  levelClassDefault: 'Using the class-wide default',
  levelUnweighted: 'Unweighted (direct score entry)',
  componentNamePlaceholder: 'Component name (e.g. Test)',
  addComponentBtn: 'Add component',
  totalLabel: (total) => `Total: ${total}%`,
  saveWeightingBtn: 'Save weighting',
  weightsSumError: (total) => `Weights must sum to 100 — currently ${total}.`,
  confirmNoWiderDefault: "This only applies to the selected term. Other terms for this class/subject don't have a default set yet, so they\u2019ll keep using direct, unweighted score entry until you configure them too (or set a default by leaving Term blank). Save anyway?",
  savedNotice: 'Saved. New CBT results and manually-entered component scores for this class will now be weighted this way.',
  saveError: 'Could not save — check the class/subject/term.',
};

const FR: GradingLabels = {
  pageTitle: 'Pondération des notes',
  description: "Décidez quelle part de la note finale d'une matière vient du Contrôle vs de l'Examen (ou toute autre répartition souhaitée). Laissez un trimestre non sélectionné pour définir une valeur par défaut s'appliquant à tous les trimestres, puis personnalisez chaque trimestre au besoin — même principe pour laisser une matière non sélectionnée afin de définir une valeur par défaut pour toute la classe.",
  selectClass: 'Sélectionner une classe',
  allSubjectsClassDefault: 'Toutes les matières (défaut de la classe)',
  allTermsDefault: 'Tous les trimestres (défaut)',
  coveragePrefix: (subjectSuffix) => `COUVERTURE ${subjectSuffix}`,
  allSubjectsClassDefaultSuffix: '— toutes les matières (défaut de la classe)',
  levelTermSubject: 'Configuré pour ce trimestre',
  levelSubjectDefault: 'Utilise le défaut de cette matière',
  levelTermClasswide: 'Utilise la pondération de classe de ce trimestre',
  levelClassDefault: 'Utilise le défaut de la classe',
  levelUnweighted: 'Non pondéré (saisie directe des notes)',
  componentNamePlaceholder: 'Nom du composant (ex. Contrôle)',
  addComponentBtn: 'Ajouter un composant',
  totalLabel: (total) => `Total : ${total}%`,
  saveWeightingBtn: 'Enregistrer la pondération',
  weightsSumError: (total) => `Les pondérations doivent totaliser 100 — actuellement ${total}.`,
  confirmNoWiderDefault: "Ceci ne s'applique qu'au trimestre sélectionné. Les autres trimestres pour cette classe/matière n'ont pas encore de valeur par défaut, donc ils continueront à utiliser la saisie directe et non pondérée des notes jusqu'à ce que vous les configuriez aussi (ou définissiez un défaut en laissant le trimestre vide). Enregistrer quand même ?",
  savedNotice: 'Enregistré. Les nouveaux résultats CBT et les notes de composants saisies manuellement pour cette classe seront désormais pondérés ainsi.',
  saveError: 'Impossible d\'enregistrer — vérifiez la classe/matière/trimestre.',
};

const GRADING_LABELS_BY_LOCALE: Record<SupportedLocale, GradingLabels> = {
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

export function gradingLabelsFor(locale: string): GradingLabels {
  return GRADING_LABELS_BY_LOCALE[locale as SupportedLocale] ?? GRADING_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
