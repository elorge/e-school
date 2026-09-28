// web/lib/i18n/terms-page-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface TermsPageLabels {
  title: string;
  lastUpdated: string;
  sections: { heading: string; body: string }[];
}

const EN_SECTIONS = [
  {
    heading: '1. The service',
    body: 'Elorge Schools ("the Platform") is a school-management service provided by Elorge Technologies Limited ("Elorge", "we") to registered schools ("you", "the School"). By creating a school workspace, you agree to these terms on behalf of your institution.',
  },
  {
    heading: '2. Your responsibilities',
    body: 'You are responsible for obtaining lawful consent from parents/guardians before submitting student data to the Platform, for the accuracy of results and records entered by your staff, and for keeping staff login credentials secure. Elorge is not responsible for data entered incorrectly by your staff.',
  },
  {
    heading: '3. The wallet & billing',
    body: "Certain features (result PIN generation, computer-based testing) draw from a prepaid wallet balance, charged per student per term at the platform's published rate. Wallet funds are non-refundable except where a charge failed to deliver the corresponding service (see Refunds).",
  },
  {
    heading: '4. Suspension',
    body: "Elorge may suspend a School's staff/admin access for non-payment or breach of these terms. Suspension does not delete data, and does not block a parent's access to their child's already-generated results via a valid PIN.",
  },
  {
    heading: '5. Availability',
    body: 'The Platform is provided "as is." We aim for high availability but do not guarantee uninterrupted service. Offline features are designed to reduce, not eliminate, the impact of connectivity issues.',
  },
  {
    heading: '6. Data ownership',
    body: "You retain ownership of all data you submit. On account termination, you may request an export of your school's data within a reasonable period before deletion.",
  },
  {
    heading: '7. Changes',
    body: 'We may update these terms; continued use after a change constitutes acceptance. Material changes will be communicated to School Admins.',
  },
];

const FR_SECTIONS = [
  {
    heading: '1. Le service',
    body: "Elorge Schools (« la Plateforme ») est un service de gestion scolaire fourni par Elorge Technologies Limited (« Elorge », « nous ») aux écoles inscrites (« vous », « l'École »). En créant un espace de travail pour votre école, vous acceptez ces conditions au nom de votre établissement.",
  },
  {
    heading: '2. Vos responsabilités',
    body: "Vous êtes responsable d'obtenir le consentement légal des parents/tuteurs avant de soumettre des données d'élèves à la Plateforme, de l'exactitude des résultats et dossiers saisis par votre personnel, et de la sécurité des identifiants de connexion du personnel. Elorge n'est pas responsable des données saisies incorrectement par votre personnel.",
  },
  {
    heading: '3. Le portefeuille et la facturation',
    body: "Certaines fonctionnalités (génération de codes PIN de résultat, épreuves sur ordinateur) puisent dans un solde de portefeuille prépayé, facturé par élève et par trimestre au tarif publié de la plateforme. Les fonds du portefeuille ne sont pas remboursables, sauf lorsqu'un prélèvement n'a pas permis de fournir le service correspondant (voir Remboursements).",
  },
  {
    heading: '4. Suspension',
    body: "Elorge peut suspendre l'accès du personnel/administrateur d'une École en cas de non-paiement ou de violation de ces conditions. La suspension ne supprime pas les données et ne bloque pas l'accès d'un parent aux résultats déjà générés de son enfant via un code PIN valide.",
  },
  {
    heading: '5. Disponibilité',
    body: "La Plateforme est fournie « telle quelle ». Nous visons une haute disponibilité mais ne garantissons pas un service ininterrompu. Les fonctionnalités hors ligne sont conçues pour réduire, et non éliminer, l'impact des problèmes de connectivité.",
  },
  {
    heading: '6. Propriété des données',
    body: "Vous conservez la propriété de toutes les données que vous soumettez. À la résiliation du compte, vous pouvez demander une exportation des données de votre école dans un délai raisonnable avant leur suppression.",
  },
  {
    heading: '7. Modifications',
    body: "Nous pouvons mettre à jour ces conditions ; la poursuite de l'utilisation après une modification constitue une acceptation. Les modifications substantielles seront communiquées aux administrateurs d'école.",
  },
];

const PT_SECTIONS = [
  {
    heading: '1. O serviço',
    body: 'Elorge Schools ("a Plataforma") é um serviço de gestão escolar fornecido pela Elorge Technologies Limited ("Elorge", "nós") a escolas registadas ("você", "a Escola"). Ao criar um espaço de trabalho para a sua escola, você aceita estes termos em nome da sua instituição.',
  },
  {
    heading: '2. As suas responsabilidades',
    body: 'Você é responsável por obter o consentimento legal dos pais/encarregados de educação antes de submeter dados de alunos à Plataforma, pela exactidão dos resultados e registos introduzidos pela sua equipa, e por manter as credenciais de acesso da equipa seguras. A Elorge não é responsável por dados introduzidos incorrectamente pela sua equipa.',
  },
  {
    heading: '3. A carteira e a facturação',
    body: "Certas funcionalidades (geração de PIN de resultados, provas por computador) utilizam um saldo pré-pago na carteira, cobrado por aluno e por período letivo à tarifa publicada da plataforma. Os fundos da carteira não são reembolsáveis, excepto quando uma cobrança não resultou na prestação do serviço correspondente (ver Reembolsos).",
  },
  {
    heading: '4. Suspensão',
    body: "A Elorge pode suspender o acesso da equipa/administração de uma Escola por falta de pagamento ou violação destes termos. A suspensão não elimina dados, nem bloqueia o acesso de um encarregado de educação aos resultados já gerados do seu educando através de um PIN válido.",
  },
  {
    heading: '5. Disponibilidade',
    body: 'A Plataforma é fornecida "tal como está". Procuramos alta disponibilidade, mas não garantimos um serviço ininterrupto. As funcionalidades offline destinam-se a reduzir, não a eliminar, o impacto de problemas de conectividade.',
  },
  {
    heading: '6. Propriedade dos dados',
    body: "Você mantém a propriedade de todos os dados que submeter. Ao encerrar a conta, pode solicitar uma exportação dos dados da sua escola dentro de um período razoável antes da eliminação.",
  },
  {
    heading: '7. Alterações',
    body: 'Podemos actualizar estes termos; a utilização continuada após uma alteração constitui aceitação. Alterações significativas serão comunicadas aos Administradores da Escola.',
  },
];

const EN: TermsPageLabels = {
  title: 'Terms of Service',
  lastUpdated: 'Last updated: [DATE] — Elorge Technologies Limited',
  sections: EN_SECTIONS,
};

const FR: TermsPageLabels = {
  title: "Conditions d'utilisation",
  lastUpdated: 'Dernière mise à jour : [DATE] — Elorge Technologies Limited',
  sections: FR_SECTIONS,
};

const PT: TermsPageLabels = {
  title: 'Termos de Serviço',
  lastUpdated: 'Última actualização: [DATE] — Elorge Technologies Limited',
  sections: PT_SECTIONS,
};

const ES_SECTIONS = [
  {
    heading: '1. El servicio',
    body: 'Elorge Schools ("la Plataforma") es un servicio de gestión escolar proporcionado por Elorge Technologies Limited ("Elorge", "nosotros") a colegios registrados ("usted", "el Colegio"). Al crear un espacio de trabajo para su colegio, usted acepta estos términos en nombre de su institución.',
  },
  {
    heading: '2. Sus responsabilidades',
    body: 'Usted es responsable de obtener el consentimiento legal de padres/tutores antes de enviar datos de alumnos a la Plataforma, de la exactitud de los resultados y registros ingresados por su personal, y de mantener seguras las credenciales de acceso del personal. Elorge no es responsable de los datos ingresados incorrectamente por su personal.',
  },
  {
    heading: '3. La billetera y la facturación',
    body: 'Ciertas funciones (generación de PIN de resultados, exámenes por computadora) usan un saldo prepago de la billetera, cobrado por alumno y por trimestre a la tarifa publicada de la plataforma. Los fondos de la billetera no son reembolsables, salvo cuando un cobro no logró entregar el servicio correspondiente (ver Reembolsos).',
  },
  {
    heading: '4. Suspensión',
    body: 'Elorge puede suspender el acceso del personal/administración de un Colegio por falta de pago o incumplimiento de estos términos. La suspensión no elimina datos, ni bloquea el acceso de un padre a los resultados ya generados de su hijo/a mediante un PIN válido.',
  },
  {
    heading: '5. Disponibilidad',
    body: 'La Plataforma se proporciona "tal cual". Buscamos una alta disponibilidad pero no garantizamos un servicio ininterrumpido. Las funciones sin conexión están diseñadas para reducir, no eliminar, el impacto de los problemas de conectividad.',
  },
  {
    heading: '6. Propiedad de los datos',
    body: 'Usted conserva la propiedad de todos los datos que envíe. Al finalizar la cuenta, puede solicitar una exportación de los datos de su colegio dentro de un período razonable antes de la eliminación.',
  },
  {
    heading: '7. Cambios',
    body: 'Podemos actualizar estos términos; el uso continuado después de un cambio constituye aceptación. Los cambios importantes se comunicarán a los administradores del colegio.',
  },
];

const ES: TermsPageLabels = {
  title: 'Términos de Servicio',
  lastUpdated: 'Última actualización: [DATE] — Elorge Technologies Limited',
  sections: ES_SECTIONS,
};

const TERMS_PAGE_LABELS_BY_LOCALE: Record<SupportedLocale, TermsPageLabels> = { en: EN, fr: FR, pt: PT, es: ES };

export function termsPageLabelsFor(locale: string): TermsPageLabels {
  return TERMS_PAGE_LABELS_BY_LOCALE[locale as SupportedLocale] ?? TERMS_PAGE_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
