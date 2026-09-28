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

const PT: GradingLabels = {
  pageTitle: 'Ponderação de Notas',
  description: 'Decida que parte da nota final de uma disciplina vem do Teste vs. Exame (ou qualquer divisão que pretenda). Deixe um período por selecionar para definir um valor predefinido que se aplica a todos os períodos, e depois substitua períodos individuais conforme necessário — a mesma lógica de deixar uma disciplina por selecionar para definir um valor predefinido para toda a turma.',
  selectClass: 'Selecione uma turma',
  allSubjectsClassDefault: 'Todas as disciplinas (predefinição da turma)',
  allTermsDefault: 'Todos os períodos (predefinição)',
  coveragePrefix: (subjectSuffix) => `COBERTURA ${subjectSuffix}`,
  allSubjectsClassDefaultSuffix: '— todas as disciplinas (predefinição da turma)',
  levelTermSubject: 'Configurado para este período',
  levelSubjectDefault: 'A usar a predefinição desta disciplina',
  levelTermClasswide: 'A usar a ponderação da turma deste período',
  levelClassDefault: 'A usar a predefinição da turma',
  levelUnweighted: 'Sem ponderação (inserção direta da nota)',
  componentNamePlaceholder: 'Nome do componente (ex. Teste)',
  addComponentBtn: 'Adicionar componente',
  totalLabel: (total) => `Total: ${total}%`,
  saveWeightingBtn: 'Guardar ponderação',
  weightsSumError: (total) => `As ponderações devem somar 100 — atualmente ${total}.`,
  confirmNoWiderDefault: 'Isto só se aplica ao período selecionado. Outros períodos desta turma/disciplina ainda não têm uma predefinição, por isso continuarão a usar a inserção direta e sem ponderação das notas até que os configure também (ou defina uma predefinição deixando o Período em branco). Guardar mesmo assim?',
  savedNotice: 'Guardado. Os novos resultados CBT e as notas de componentes inseridas manualmente para esta turma serão agora ponderados desta forma.',
  saveError: 'Não foi possível guardar — verifique a turma/disciplina/período.',
};

const ES: GradingLabels = {
  pageTitle: 'Ponderación de calificaciones',
  description: 'Decida qué parte de la calificación final de una asignatura proviene de Prueba vs. Examen (o cualquier desglose que desee). Deje un trimestre sin seleccionar para establecer un valor predeterminado que se aplique a todos los trimestres, y luego anule trimestres individuales según sea necesario; la misma idea que dejar una asignatura sin seleccionar para establecer un valor predeterminado para toda la clase.',
  selectClass: 'Seleccione una clase',
  allSubjectsClassDefault: 'Todas las asignaturas (predeterminado de la clase)',
  allTermsDefault: 'Todos los trimestres (predeterminado)',
  coveragePrefix: (subjectSuffix) => `COBERTURA ${subjectSuffix}`,
  allSubjectsClassDefaultSuffix: '— todas las asignaturas (predeterminado de la clase)',
  levelTermSubject: 'Configurado para este trimestre',
  levelSubjectDefault: 'Usando el predeterminado de esta asignatura',
  levelTermClasswide: 'Usando la ponderación de la clase de este trimestre',
  levelClassDefault: 'Usando el predeterminado de la clase',
  levelUnweighted: 'Sin ponderar (ingreso directo de la calificación)',
  componentNamePlaceholder: 'Nombre del componente (p. ej. Prueba)',
  addComponentBtn: 'Agregar componente',
  totalLabel: (total) => `Total: ${total}%`,
  saveWeightingBtn: 'Guardar ponderación',
  weightsSumError: (total) => `Las ponderaciones deben sumar 100; actualmente ${total}.`,
  confirmNoWiderDefault: 'Esto solo se aplica al trimestre seleccionado. Otros trimestres de esta clase/asignatura aún no tienen un valor predeterminado, por lo que seguirán usando el ingreso directo y sin ponderar de las calificaciones hasta que también los configure (o establezca un predeterminado dejando el Trimestre en blanco). ¿Guardar de todos modos?',
  savedNotice: 'Guardado. Los nuevos resultados de CBT y las calificaciones de componentes ingresadas manualmente para esta clase se ponderarán de esta forma a partir de ahora.',
  saveError: 'No se pudo guardar; verifique la clase/asignatura/trimestre.',
};

const GRADING_LABELS_BY_LOCALE: Record<SupportedLocale, GradingLabels> = {
  en: EN,
  fr: FR,
  pt: PT,
  es: ES,
};

export function gradingLabelsFor(locale: string): GradingLabels {
  return GRADING_LABELS_BY_LOCALE[locale as SupportedLocale] ?? GRADING_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
