// backend/src/common/i18n/report-labels.ts
/**
 * Every fixed string drawn onto a report card PDF (see
 * modules/reports/reports.service.ts), keyed by the school's locale —
 * NOT the student's or the parent's. A report card is issued by the
 * school in the school's language, the same way its currency and
 * timezone are the school's, not the reader's.
 *
 * This does NOT translate school-entered content: subject names,
 * teacher comments, and the school's own name/address are whatever the
 * school typed in and are rendered as-is regardless of locale. Only the
 * platform's own labels (headings, the "Admission ID:" prefix, the
 * strength/weakness legend, the recommendation sentence templates) come
 * from here.
 */
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../utils/locale.util';

export interface ReportLabels {
  reportCardTitle: (termName: string) => string;
  admissionId: (id: string) => string;
  subjectScores: string;
  strengthWeakness: string;
  strengthWeaknessLegend: string;
  teacherRecommendation: string;
  teachersComment: string;
  noScoresRecorded: string;
  strongPerformanceIn: (subjects: string) => string;
  couldImproveIn: (subjects: string) => string;
  needsSupportIn: (subjects: string) => string;
  noPhoto: string;
  idCardIdPrefix: (id: string) => string;
  scanForAttendance: string;
}

const EN: ReportLabels = {
  reportCardTitle: (termName) => `Report Card — ${termName}`,
  admissionId: (id) => `Admission ID: ${id}`,
  subjectScores: 'Subject Scores',
  strengthWeakness: 'Areas of Strength & Weakness',
  strengthWeaknessLegend: 'Green = strength (70+)  Amber = needs improvement (50-69)  Red = at risk (below 50)',
  teacherRecommendation: 'Teacher Recommendation',
  teachersComment: "Teacher's Comment",
  noScoresRecorded: 'No subject scores recorded for this term.',
  strongPerformanceIn: (subjects) => `Strong performance in ${subjects}.`,
  couldImproveIn: (subjects) => `Could improve with more practice in ${subjects}.`,
  needsSupportIn: (subjects) => `Needs focused support and possibly extra lessons in ${subjects}.`,
  noPhoto: 'No photo',
  idCardIdPrefix: (id) => `ID: ${id}`,
  scanForAttendance: 'Scan for attendance',
};

const FR: ReportLabels = {
  reportCardTitle: (termName) => `Bulletin scolaire — ${termName}`,
  admissionId: (id) => `Matricule : ${id}`,
  subjectScores: 'Notes par matière',
  strengthWeakness: 'Points forts et points à améliorer',
  strengthWeaknessLegend: 'Vert = point fort (70+)  Orange = à améliorer (50-69)  Rouge = en difficulté (moins de 50)',
  teacherRecommendation: "Recommandation de l'enseignant",
  teachersComment: "Commentaire de l'enseignant",
  noScoresRecorded: 'Aucune note enregistrée pour ce trimestre.',
  strongPerformanceIn: (subjects) => `Bonne performance en ${subjects}.`,
  couldImproveIn: (subjects) => `Pourrait progresser avec plus de pratique en ${subjects}.`,
  needsSupportIn: (subjects) => `A besoin d'un soutien ciblé, éventuellement de cours supplémentaires, en ${subjects}.`,
  noPhoto: 'Sans photo',
  idCardIdPrefix: (id) => `Matricule : ${id}`,
  scanForAttendance: 'Scanner pour la présence',
};

const REPORT_LABELS_BY_LOCALE: Record<SupportedLocale, ReportLabels> = { en: EN, fr: FR };

export function reportLabelsFor(locale: string): ReportLabels {
  return REPORT_LABELS_BY_LOCALE[locale as SupportedLocale] ?? REPORT_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
