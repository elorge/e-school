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

const PT: ReportLabels = {
  reportCardTitle: (termName) => `Boletim Escolar — ${termName}`,
  admissionId: (id) => `Número de Matrícula: ${id}`,
  subjectScores: 'Notas por Disciplina',
  strengthWeakness: 'Pontos Fortes e Pontos a Melhorar',
  strengthWeaknessLegend: 'Verde = ponto forte (70+)  Âmbar = a melhorar (50-69)  Vermelho = em risco (abaixo de 50)',
  teacherRecommendation: 'Recomendação do Professor',
  teachersComment: 'Comentário do Professor',
  noScoresRecorded: 'Nenhuma nota registada para este período.',
  strongPerformanceIn: (subjects) => `Bom desempenho em ${subjects}.`,
  couldImproveIn: (subjects) => `Poderia melhorar com mais prática em ${subjects}.`,
  needsSupportIn: (subjects) => `Precisa de apoio focado, possivelmente aulas extra, em ${subjects}.`,
  noPhoto: 'Sem foto',
  idCardIdPrefix: (id) => `Nº: ${id}`,
  scanForAttendance: 'Digitalizar para presença',
};

const ES: ReportLabels = {
  reportCardTitle: (termName) => `Boleta de Calificaciones — ${termName}`,
  admissionId: (id) => `Número de matrícula: ${id}`,
  subjectScores: 'Calificaciones por asignatura',
  strengthWeakness: 'Fortalezas y áreas a mejorar',
  strengthWeaknessLegend: 'Verde = fortaleza (70+)  Ámbar = necesita mejorar (50-69)  Rojo = en riesgo (menos de 50)',
  teacherRecommendation: 'Recomendación del docente',
  teachersComment: 'Comentario del docente',
  noScoresRecorded: 'No se registraron calificaciones para este trimestre.',
  strongPerformanceIn: (subjects) => `Buen desempeño en ${subjects}.`,
  couldImproveIn: (subjects) => `Podría mejorar con más práctica en ${subjects}.`,
  needsSupportIn: (subjects) => `Necesita apoyo específico, posiblemente clases adicionales, en ${subjects}.`,
  noPhoto: 'Sin foto',
  idCardIdPrefix: (id) => `N.º: ${id}`,
  scanForAttendance: 'Escanear para asistencia',
};

const REPORT_LABELS_BY_LOCALE: Record<SupportedLocale, ReportLabels> = { en: EN, fr: FR, pt: PT, es: ES };

export function reportLabelsFor(locale: string): ReportLabels {
  return REPORT_LABELS_BY_LOCALE[locale as SupportedLocale] ?? REPORT_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
