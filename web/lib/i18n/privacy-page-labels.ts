// web/lib/i18n/privacy-page-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface PrivacyPageLabels {
  title: string;
  lastUpdated: string;
  sections: { heading: string; body: string }[];
  contactHeading: string;
  contactPrefix: string;
}

const EN_SECTIONS = [
  {
    heading: '1. What we collect',
    body: "To operate Elorge Schools, participating schools submit personal data about students (name, date of birth/admission year, class, photograph, academic results, attendance records) and staff/guardians (name, email, phone number where provided). We also process payment records tied to a school's wallet, not to individual parents directly, unless a parent's own name/phone is entered by the school as part of a fee record.",
  },
  {
    heading: '2. Who controls this data',
    body: "Each school is the data controller for its own students' and staff's records under the Nigeria Data Protection Act (NDPA) — schools are responsible for having lawful basis (parental/guardian consent or legitimate educational interest) to submit student data to us. Elorge Technologies Limited acts as a data processor, storing and processing this data on the school's behalf and instruction.",
  },
  {
    heading: '3. How we use it',
    body: "Data is used solely to provide the platform's functions: generating results, ID cards, attendance records, fee invoices, and related school-management features. We do not sell student or staff data to third parties, and we do not use student data for advertising.",
  },
  {
    heading: '4. Where data is stored',
    body: "Application data is stored on Supabase (PostgreSQL). Uploaded images (student photos, school logos, signatures) are stored on Cloudinary. Both are third-party infrastructure providers bound by their own security commitments; neither is authorized to use this data for their own purposes.",
  },
  {
    heading: '5. Retention',
    body: "Academic records are retained for as long as a school's account remains active, plus a reasonable period after account closure to allow the school to export or transfer records. A suspended school's data is not deleted — suspension restricts access, it does not destroy data.",
  },
  {
    heading: "6. A guardian's rights",
    body: 'A parent or guardian who wants a student\'s data corrected or removed should contact their school directly, as the school controls that data. Schools can reach us at hello@elorgeschools.com for any data-processing requests they need help fulfilling.',
  },
  {
    heading: '7. Security',
    body: "Passwords are hashed, never stored in plaintext. Result PINs are hashed. Access to any school's data is restricted to that school's own authenticated staff, plus Elorge platform staff for support purposes.",
  },
];

const FR_SECTIONS = [
  {
    heading: '1. Ce que nous collectons',
    body: "Pour faire fonctionner Elorge Schools, les écoles participantes soumettent des données personnelles sur les élèves (nom, date de naissance/année d'admission, classe, photographie, résultats scolaires, registres de présence) et sur le personnel/tuteurs (nom, e-mail, numéro de téléphone si fourni). Nous traitons également les registres de paiement liés au portefeuille d'une école, et non directement aux parents individuels, sauf si le nom/téléphone d'un parent est saisi par l'école dans le cadre d'un registre de frais.",
  },
  {
    heading: '2. Qui contrôle ces données',
    body: "Chaque école est le responsable du traitement des dossiers de ses propres élèves et personnel en vertu de la loi nigériane sur la protection des données (NDPA) — les écoles sont responsables d'avoir une base légale (consentement parental/du tuteur ou intérêt éducatif légitime) pour nous soumettre des données d'élèves. Elorge Technologies Limited agit en tant que sous-traitant, stockant et traitant ces données pour le compte et selon les instructions de l'école.",
  },
  {
    heading: '3. Comment nous les utilisons',
    body: "Les données sont utilisées uniquement pour fournir les fonctions de la plateforme : génération de résultats, cartes d'identité, registres de présence, factures de frais, et fonctionnalités connexes de gestion scolaire. Nous ne vendons pas les données des élèves ou du personnel à des tiers, et nous n'utilisons pas les données des élèves à des fins publicitaires.",
  },
  {
    heading: '4. Où les données sont stockées',
    body: "Les données de l'application sont stockées sur Supabase (PostgreSQL). Les images téléversées (photos d'élèves, logos d'école, signatures) sont stockées sur Cloudinary. Ces deux prestataires d'infrastructure tiers sont liés par leurs propres engagements de sécurité ; aucun n'est autorisé à utiliser ces données à ses propres fins.",
  },
  {
    heading: '5. Conservation',
    body: "Les dossiers scolaires sont conservés tant que le compte d'une école reste actif, plus une période raisonnable après la fermeture du compte pour permettre à l'école d'exporter ou de transférer ses dossiers. Les données d'une école suspendue ne sont pas supprimées — la suspension restreint l'accès, elle ne détruit pas les données.",
  },
  {
    heading: "6. Les droits d'un tuteur",
    body: "Un parent ou tuteur souhaitant faire corriger ou supprimer les données d'un élève doit contacter directement son école, car c'est elle qui contrôle ces données. Les écoles peuvent nous joindre à hello@elorgeschools.com pour toute demande de traitement de données qu'elles ont besoin de nous aider à satisfaire.",
  },
  {
    heading: '7. Sécurité',
    body: "Les mots de passe sont hachés, jamais stockés en clair. Les codes PIN de résultat sont hachés. L'accès aux données de toute école est restreint au personnel authentifié de cette école, ainsi qu'au personnel de la plateforme Elorge à des fins de support.",
  },
];

const EN: PrivacyPageLabels = {
  title: 'Privacy Policy',
  lastUpdated: 'Last updated: [DATE] — Elorge Technologies Limited',
  sections: EN_SECTIONS,
  contactHeading: '8. Contact',
  contactPrefix: 'Questions about this policy:',
};

const FR: PrivacyPageLabels = {
  title: 'Politique de confidentialité',
  lastUpdated: 'Dernière mise à jour : [DATE] — Elorge Technologies Limited',
  sections: FR_SECTIONS,
  contactHeading: '8. Contact',
  contactPrefix: 'Questions sur cette politique :',
};

const PRIVACY_PAGE_LABELS_BY_LOCALE: Record<SupportedLocale, PrivacyPageLabels> = { en: EN, fr: FR };

export function privacyPageLabelsFor(locale: string): PrivacyPageLabels {
  return PRIVACY_PAGE_LABELS_BY_LOCALE[locale as SupportedLocale] ?? PRIVACY_PAGE_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
