// web/lib/i18n/settings-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface SettingsLabels {
  pageTitle: string;
  languageHeading: string;
  languageHelp: string;
  languageUpdatedNotice: string;
  languageUpdateError: string;
  logoHeading: string;
  logoHelp: string;
  logoUpdatedNotice: string;
  logoUploadError: string;
  uploadingBtn: string;
  uploadLogoBtn: string;
  signatureHeading: string;
  signatureHelp: string;
  signatureUpdatedNotice: string;
  signatureUploadError: string;
  uploadSignatureBtn: string;
}

const EN: SettingsLabels = {
  pageTitle: 'Settings',
  languageHeading: 'Language',
  languageHelp: "Sets the language for report cards, CBT screens, and emails Elorge sends about your school. Teacher-written content — subject names, comments, your school's own name — is never translated; it stays exactly as entered.",
  languageUpdatedNotice: 'Language updated — new report cards, CBT screens, and emails will use it. Anything already generated stays as it was.',
  languageUpdateError: 'Could not update language. Please try again.',
  logoHeading: 'School logo',
  logoHelp: "Used on report cards, ID cards, and the academic calendar — never Elorge's own logo.",
  logoUpdatedNotice: 'School logo updated — it will now appear on report cards, ID cards, and the calendar.',
  logoUploadError: 'Could not upload logo. Try a smaller image (under 5MB).',
  uploadingBtn: 'Uploading…',
  uploadLogoBtn: 'Upload logo',
  signatureHeading: 'Head of School signature',
  signatureHelp: 'A scanned or photographed signature, ideally on a plain background — appears on printed report cards.',
  signatureUpdatedNotice: 'Signature updated — it will now appear on report cards.',
  signatureUploadError: 'Could not upload signature. Try a smaller image (under 5MB).',
  uploadSignatureBtn: 'Upload signature',
};

const FR: SettingsLabels = {
  pageTitle: 'Paramètres',
  languageHeading: 'Langue',
  languageHelp: "Définit la langue des bulletins scolaires, des écrans d'épreuves (CBT) et des e-mails qu'Elorge envoie au sujet de votre école. Le contenu saisi par les enseignants — noms de matières, commentaires, nom de votre école — n'est jamais traduit ; il reste exactement tel quel.",
  languageUpdatedNotice: 'Langue mise à jour — les nouveaux bulletins, écrans CBT et e-mails l\'utiliseront. Ce qui a déjà été généré reste inchangé.',
  languageUpdateError: 'Impossible de mettre à jour la langue. Veuillez réessayer.',
  logoHeading: "Logo de l'école",
  logoHelp: "Utilisé sur les bulletins, cartes d'identité et le calendrier académique — jamais le logo d'Elorge.",
  logoUpdatedNotice: "Logo de l'école mis à jour — il apparaîtra désormais sur les bulletins, cartes d'identité et le calendrier.",
  logoUploadError: 'Impossible de téléverser le logo. Essayez une image plus petite (moins de 5 Mo).',
  uploadingBtn: 'Téléversement…',
  uploadLogoBtn: 'Téléverser le logo',
  signatureHeading: "Signature du chef d'établissement",
  signatureHelp: 'Une signature scannée ou photographiée, idéalement sur fond uni — apparaît sur les bulletins imprimés.',
  signatureUpdatedNotice: 'Signature mise à jour — elle apparaîtra désormais sur les bulletins.',
  signatureUploadError: 'Impossible de téléverser la signature. Essayez une image plus petite (moins de 5 Mo).',
  uploadSignatureBtn: 'Téléverser la signature',
};

const PT: SettingsLabels = {
  pageTitle: 'Definições',
  languageHeading: 'Idioma',
  languageHelp: 'Define o idioma dos boletins escolares, ecrãs de provas (CBT) e e-mails que a Elorge envia sobre a sua escola. O conteúdo escrito por professores — nomes de disciplinas, comentários, o nome da sua própria escola — nunca é traduzido; permanece exatamente como foi inserido.',
  languageUpdatedNotice: 'Idioma atualizado — os novos boletins, ecrãs CBT e e-mails irão utilizá-lo. Tudo o que já foi gerado permanece como estava.',
  languageUpdateError: 'Não foi possível atualizar o idioma. Por favor, tente novamente.',
  logoHeading: 'Logótipo da escola',
  logoHelp: 'Utilizado nos boletins, cartões de identificação e no calendário académico — nunca o logótipo da Elorge.',
  logoUpdatedNotice: 'Logótipo da escola atualizado — passará a aparecer nos boletins, cartões de identificação e no calendário.',
  logoUploadError: 'Não foi possível carregar o logótipo. Tente uma imagem mais pequena (menos de 5MB).',
  uploadingBtn: 'A carregar…',
  uploadLogoBtn: 'Carregar logótipo',
  signatureHeading: 'Assinatura do Diretor(a) da Escola',
  signatureHelp: 'Uma assinatura digitalizada ou fotografada, idealmente sobre fundo liso — aparece nos boletins impressos.',
  signatureUpdatedNotice: 'Assinatura atualizada — passará a aparecer nos boletins.',
  signatureUploadError: 'Não foi possível carregar a assinatura. Tente uma imagem mais pequena (menos de 5MB).',
  uploadSignatureBtn: 'Carregar assinatura',
};

const SETTINGS_LABELS_BY_LOCALE: Record<SupportedLocale, SettingsLabels> = {
  en: EN,
  fr: FR,
  pt: PT,
};

export function settingsLabelsFor(locale: string): SettingsLabels {
  return SETTINGS_LABELS_BY_LOCALE[locale as SupportedLocale] ?? SETTINGS_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
