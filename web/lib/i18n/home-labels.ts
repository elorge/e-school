// web/lib/i18n/home-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface HomeLabels {
  kicker: string;
  heroTitle: string;
  heroSubtitle: string;
  getStarted: string;
  signIn: string;
  mockSchoolName: string;
  mockTermLabel: string;
  admissionIdLabel: string;
  verifiedLabel: string;
  coreFeaturesHeading: string;
  coreFeatures: { title: string; body: string }[];
  globalKicker: string;
  globalHeading: string;
  globalBody: string;
  dontSeeCountry: string;
  talkToUs: string;
  addingCorridors: string;
  sessionWrapKicker: string;
  sessionWrapHeading: string;
  sessionWrapBody: string;
  sessionWrapCardYear: string;
  sessionWrapCardTerms: string;
  fieldsWorthExploring: string;
  cbtKicker: string;
  cbtHeading: string;
  cbtBody: string;
  cbtFeatures: { title: string; body: string }[];
  lessonNotesKicker: string;
  lessonNotesHeading: string;
  lessonNotesBody: string;
  lessonNotesFeatures: { title: string; body: string }[];
  presentationLabel: string;
  presentationSubject: string;
  presentationTitle: string;
  whiteboardActive: string;
  offlineKicker: string;
  offlineHeading: string;
  offlineBody: string;
  financeKicker: string;
  financeHeading: string;
  financeBody: string;
  financeFeatures: { title: string; body: string }[];
  operationsHeading: string;
  runSchoolFeatures: { title: string; body: string }[];
  infrastructureKicker: string;
  infrastructureHeading: string;
  infrastructureBody: string;
  infrastructureFeatures: { title: string; body: string }[];
  interestedInThis: string;
  advisePrefix: string;
  faqHeading: string;
  faqs: { q: string; a: string }[];
  credibility: string;
  finalCtaHeading: string;
}

const EN_CORE_FEATURES = [
  { title: 'Results that verify themselves', body: 'Every report card carries a QR stamp a parent can scan to confirm it\'s real — no more doubting a transcript.' },
  { title: 'ID cards & gate attendance', body: 'Issue a digital ID the day a student is registered. Scan it at the gate — even if the gate has no signal that morning.' },
  { title: 'One wallet, not three invoices', body: 'Fund once, in your own currency. Result PINs and computer-based tests draw from the same per-student charge — never billed twice for the same student in the same term.' },
  { title: 'A calendar every teacher can print', body: 'Lay out a term in minutes, then hand every class teacher a printable copy — no more retyping the same dates by hand.' },
];

const FR_CORE_FEATURES = [
  { title: 'Des résultats qui se vérifient eux-mêmes', body: "Chaque bulletin porte un code QR qu'un parent peut scanner pour confirmer son authenticité — plus jamais de doute sur un relevé." },
  { title: "Cartes d'identité et présence au portail", body: "Émettez une carte d'identité numérique le jour même de l'inscription. Scannez-la au portail — même sans réseau ce matin-là." },
  { title: "Un seul portefeuille, pas trois factures", body: "Approvisionnez une fois, dans votre propre devise. Les codes PIN de résultat et les épreuves sur ordinateur puisent dans la même charge par élève — jamais facturé deux fois pour le même élève le même trimestre." },
  { title: "Un calendrier que chaque enseignant peut imprimer", body: "Construisez un trimestre en quelques minutes, puis remettez à chaque professeur principal une copie imprimable — plus besoin de retaper les mêmes dates à la main." },
];

const EN_CBT_FEATURES = [
  { title: 'Scheduled, not open-ended', body: "A test's access code only works on its scheduled day, within a set window — not next week, not next month." },
  { title: 'Works if the lab loses signal', body: "Answers save to the device first and sync the moment connectivity returns — a dropped connection never loses a student's progress." },
  { title: 'One school, no lab required', body: 'Schools without a full computer lab still enter every score by hand — nothing here is required to use the rest of the platform.' },
];

const FR_CBT_FEATURES = [
  { title: 'Programmée, pas ouverte indéfiniment', body: "Le code d'accès d'une épreuve ne fonctionne que le jour prévu, dans une fenêtre définie — pas la semaine prochaine, pas le mois prochain." },
  { title: 'Fonctionne même sans réseau au labo', body: "Les réponses s'enregistrent d'abord sur l'appareil et se synchronisent dès le retour de la connexion — une coupure ne fait jamais perdre la progression d'un élève." },
  { title: "Une école, pas de labo requis", body: "Les écoles sans labo informatique complet saisissent quand même chaque note à la main — rien ici n'est obligatoire pour utiliser le reste de la plateforme." },
];

const EN_LESSON_NOTES_FEATURES = [
  { title: 'A format teachers already know', body: 'A structured lesson-note format — not a blank text box.' },
  { title: 'One click to the projector', body: 'The same note becomes a clean, full-screen slide deck — no separate slides to build.' },
  { title: 'Whiteboard, built in', body: 'Pen, eraser, and colors, right over the slide — for working through a step live.' },
];

const FR_LESSON_NOTES_FEATURES = [
  { title: 'Un format que les enseignants connaissent déjà', body: 'Un format structuré de note de cours — pas une simple page blanche.' },
  { title: 'Un clic vers le projecteur', body: 'La même note devient un diaporama plein écran soigné — pas besoin de construire des diapositives séparées.' },
  { title: 'Tableau blanc intégré', body: 'Stylo, gomme et couleurs, directement sur la diapositive — pour travailler une étape en direct.' },
];

const EN_FINANCE_FEATURES = [
  { title: 'Fees & invoicing', body: 'Generate invoices per class per term, record payments, and see who still owes at a glance.' },
  { title: 'Inventory', body: 'Stock in and out, with automatic low-stock flags before you run out of essentials.' },
  { title: 'Accounting', body: 'Income and expenditure, by category, for any period — exported to Excel in one click.' },
];

const FR_FINANCE_FEATURES = [
  { title: 'Frais et facturation', body: 'Générez des factures par classe et par trimestre, enregistrez les paiements et voyez en un coup d\'œil qui doit encore payer.' },
  { title: 'Inventaire', body: "Entrées et sorties de stock, avec des alertes automatiques de stock faible avant la rupture." },
  { title: 'Comptabilité', body: "Revenus et dépenses, par catégorie, pour n'importe quelle période — exportés vers Excel en un clic." },
];

const EN_RUN_SCHOOL_FEATURES = [
  { title: 'Bulk student import', body: 'Already have 400 students on paper or in another system? Download a template, fill it in Excel offline, and upload it — with row-by-row error feedback if something needs fixing.' },
  { title: 'One-click end-of-session promotion', body: 'Move a whole class up a grade in a few clicks at year-end, instead of editing every student one at a time.' },
  { title: 'Staff invites, done properly', body: 'Invite a teacher by email — they set their own password to activate, or an admin can set one directly with a forced change on first login.' },
];

const FR_RUN_SCHOOL_FEATURES = [
  { title: 'Importation groupée des élèves', body: "Vous avez déjà 400 élèves sur papier ou dans un autre système ? Téléchargez un modèle, remplissez-le dans Excel hors ligne, puis importez-le — avec un retour d'erreur ligne par ligne si besoin de corriger." },
  { title: 'Promotion de fin d\'année en un clic', body: "Faites passer toute une classe au niveau supérieur en quelques clics en fin d'année, au lieu de modifier chaque élève un par un." },
  { title: 'Invitations du personnel, faites correctement', body: "Invitez un enseignant par e-mail — il définit son propre mot de passe pour activer son compte, ou un administrateur peut en définir un directement avec changement obligatoire à la première connexion." },
];

const EN_INFRASTRUCTURE_FEATURES = [
  { title: 'ID card printing', body: 'Printers and blank cards to turn the digital ID cards you already generate into physical ones.' },
  { title: 'Gate scanners', body: 'QR/barcode scanners matched to the attendance flow, with a setup guide included.' },
  { title: 'CBT lab computers', body: 'Entry-level lab hardware sized for computer-based testing, for schools not yet fully equipped.' },
  { title: 'Network setup', body: 'Structured wiring and routers so the "works even offline" promise holds up on your actual campus wifi.' },
];

const FR_INFRASTRUCTURE_FEATURES = [
  { title: "Impression de cartes d'identité", body: "Imprimantes et cartes vierges pour transformer les cartes d'identité numériques que vous générez déjà en cartes physiques." },
  { title: 'Scanners de portail', body: "Scanners QR/code-barres adaptés au flux de présence, avec un guide d'installation inclus." },
  { title: 'Ordinateurs de labo pour les épreuves', body: "Matériel de labo d'entrée de gamme dimensionné pour les épreuves sur ordinateur, pour les écoles pas encore entièrement équipées." },
  { title: 'Installation réseau', body: "Câblage structuré et routeurs pour que la promesse « fonctionne même hors ligne » tienne sur le wifi réel de votre campus." },
];

const EN_FAQS = [
  { q: 'How does a parent check a school result online with Elorge?', a: "A parent visits the school's results page, enters the student's Admission ID and a result PIN issued by the school, and sees a verified, QR-stamped report card — no account required." },
  { q: 'Does Elorge support computer-based testing (CBT)?', a: 'Yes. Schools with a computer lab can build a question bank, publish scheduled tests with a spoken access code, and objective questions grade instantly. Schools without a lab can skip CBT entirely and enter scores by hand.' },
  { q: 'Can teachers write and present lesson notes on Elorge?', a: 'Yes. Teachers write lesson notes in a structured format — objectives, previous knowledge, presentation, evaluation, assignment — then turn any note into a full-screen slide deck for the projector with one click, complete with a built-in whiteboard.' },
  { q: 'Does Elorge work without internet access?', a: 'Yes. Elorge is installable as an app on phone or desktop and keeps working through outages — registering students, entering scores, and sitting CBT tests offline — syncing everything the moment connectivity returns.' },
  { q: 'Is Elorge only for schools in Nigeria?', a: "No. Elorge started in Nigeria and now onboards schools in several countries, each billed in its own currency through Flutterwave — your school's academic structure (terms, semesters, or quarters) and subject list are entirely your own too, not fixed to any one country's curriculum." },
  { q: 'What academic calendar does Elorge assume — terms, semesters, or something else?', a: "Whatever your school actually uses. A school can run 2 semesters, 3 terms, 4 quarters, or any other structure, and label periods however they normally would — nothing is hardcoded to one country's academic calendar." },
];

const FR_FAQS = [
  { q: 'Comment un parent vérifie-t-il un résultat scolaire en ligne avec Elorge ?', a: "Un parent se rend sur la page de résultats de l'école, saisit le matricule de l'élève et un code PIN de résultat délivré par l'école, et voit un bulletin vérifié et estampillé QR — aucun compte requis." },
  { q: 'Elorge prend-il en charge les épreuves sur ordinateur (CBT) ?', a: "Oui. Les écoles disposant d'un labo informatique peuvent constituer une banque de questions, publier des épreuves programmées avec un code d'accès communiqué oralement, et les questions à choix objectif sont corrigées instantanément. Les écoles sans labo peuvent se passer entièrement du CBT et saisir les notes à la main." },
  { q: 'Les enseignants peuvent-ils rédiger et présenter des notes de cours sur Elorge ?', a: "Oui. Les enseignants rédigent leurs notes de cours dans un format structuré — objectifs, prérequis, présentation, évaluation, devoir — puis transforment n'importe quelle note en diaporama plein écran pour le projecteur en un clic, avec un tableau blanc intégré." },
  { q: 'Elorge fonctionne-t-il sans accès internet ?', a: "Oui. Elorge s'installe comme une application sur téléphone ou ordinateur et continue de fonctionner pendant les coupures — inscription des élèves, saisie des notes, passage des épreuves CBT hors ligne — en synchronisant tout dès le retour de la connexion." },
  { q: "Elorge est-il réservé aux écoles du Nigeria ?", a: "Non. Elorge a démarré au Nigeria et accueille désormais des écoles dans plusieurs pays, chacune facturée dans sa propre devise via Flutterwave — la structure académique de votre école (trimestres, semestres ou autre) et sa liste de matières vous appartiennent entièrement aussi, sans être figées sur le programme d'un seul pays." },
  { q: 'Quel calendrier académique Elorge suppose-t-il — trimestres, semestres, ou autre chose ?', a: "Celui que votre école utilise réellement. Une école peut fonctionner avec 2 semestres, 3 trimestres, 4 quarts, ou toute autre structure, et nommer ses périodes comme elle le fait habituellement — rien n'est figé sur le calendrier académique d'un seul pays." },
];

const EN: HomeLabels = {
  kicker: 'Elorge Technologies School Management Software',
  heroTitle: "A record your parents don't have to take your word for.",
  heroSubtitle: 'Results, ID cards, attendance, fees, computer-based tests, and school finances — in one place, working the way your school actually runs: sometimes with signal, sometimes without, wherever your school is.',
  getStarted: 'Get started',
  signIn: 'Sign in',
  mockSchoolName: 'Greenwood College',
  mockTermLabel: '2025/2026 — Term 2',
  admissionIdLabel: 'Admission ID',
  verifiedLabel: 'Verified — scan to confirm at elorgeschools.org/verify',
  coreFeaturesHeading: "Everything a registrar's office actually does, in one login.",
  coreFeatures: EN_CORE_FEATURES,
  globalKicker: 'Not just Nigeria',
  globalHeading: 'Built in Nigeria. Built to run anywhere.',
  globalBody: "Your school's country, currency, academic calendar, and subject list are all your own — nothing here assumes one country's system. A school anywhere sets up its own workspace and is billed in its own currency through Flutterwave.",
  dontSeeCountry: "Don't see your country?",
  talkToUs: 'Talk to us',
  addingCorridors: "— we're adding corridors as schools ask for them.",
  sessionWrapKicker: 'Session Wrap',
  sessionWrapHeading: 'A session of scores, turned into a starting point for a real conversation.',
  sessionWrapBody: "At the end of an academic session, Elorge looks at what a student was consistently strong in — not one lucky test, a whole session — and surfaces fields worth exploring because of it. Career-field suggestions aren't fixed to one curriculum either: a school teaching subjects outside the built-in defaults links its own on the way to the same suggestions. It's not a verdict, and we say so on every copy: a starting point for a parent-teacher conversation, not a replacement for one.",
  sessionWrapCardYear: '2025/2026',
  sessionWrapCardTerms: '3 terms on file',
  fieldsWorthExploring: 'Fields worth exploring',
  cbtKicker: 'Computer-based testing',
  cbtHeading: 'For schools with a computer lab — objective questions score themselves.',
  cbtBody: "Build a question bank by hand, or download a template, fill it in Excel offline, and upload it in one go. Publish a test with a scheduled date and a spoken access code — students log in with just their Admission ID, no accounts to create. Objective scores grade instantly; a teacher adds the theory score once submissions are in, and the combined result flows straight into the same report card, protected by the same parent PIN. No separate system to check.",
  cbtFeatures: EN_CBT_FEATURES,
  lessonNotesKicker: 'Lesson notes',
  lessonNotesHeading: 'Written once, taught on the board, read again at home.',
  lessonNotesBody: "Teachers write in a structured format used for supervision — objectives, previous knowledge, presentation, evaluation, assignment. One click turns it into a full-screen slide deck for the projector, with a whiteboard overlay for working through a problem live. Publish it, and it's there for that class's students to read again at home, at their own pace — gated to their own class, not the open internet.",
  lessonNotesFeatures: EN_LESSON_NOTES_FEATURES,
  presentationLabel: 'Presentation',
  presentationSubject: 'Mathematics — JSS 2',
  presentationTitle: 'Solving for x:',
  whiteboardActive: 'Whiteboard active',
  offlineKicker: 'Offline-first',
  offlineHeading: 'Register a student, enter a score, sit a test — with no signal at all.',
  offlineBody: "The power goes out mid-registration season, or the campus wifi drops without warning. Elorge is installable straight from your browser, works as a real app on your phone or desktop, and keeps working through the outage — syncing everything the moment you're back.",
  financeKicker: 'Beyond academics',
  financeHeading: 'A finance office, built in.',
  financeBody: "Set a term's fees once, generate invoices for every class, and record payments as they land — cash or transfer, in your own currency. Track supplies and equipment so you know before you run out. See income against expenses for any date range, exportable to Excel for your accountant.",
  financeFeatures: EN_FINANCE_FEATURES,
  operationsHeading: 'Onboarding is fast, even with hundreds of existing students.',
  runSchoolFeatures: EN_RUN_SCHOOL_FEATURES,
  infrastructureKicker: 'Beyond the software',
  infrastructureHeading: 'Elorge is also an IT infrastructure company — we can help with the hardware side too.',
  infrastructureBody: "The platform works whether or not you have any of this — but if you're setting up ID cards, a computer lab, or gate attendance for the first time, we can point you to the right equipment and help you set it up.",
  infrastructureFeatures: EN_INFRASTRUCTURE_FEATURES,
  interestedInThis: 'Interested in any of this?',
  advisePrefix: "— we'll advise on what actually fits your school before recommending anything.",
  faqHeading: 'Common questions.',
  faqs: EN_FAQS,
  credibility: 'Built for schools that take their records seriously — from single-campus academies to multi-branch colleges, in every country we operate in.',
  finalCtaHeading: 'Ready to see it running on your own data?',
};

const FR: HomeLabels = {
  kicker: 'Elorge Technologies — Logiciel de gestion scolaire',
  heroTitle: "Un dossier que vos parents n'ont pas à croire sur parole.",
  heroSubtitle: "Résultats, cartes d'identité, présence, frais, épreuves sur ordinateur et finances scolaires — au même endroit, fonctionnant comme votre école fonctionne réellement : parfois avec réseau, parfois sans, où que soit votre école.",
  getStarted: 'Commencer',
  signIn: 'Se connecter',
  mockSchoolName: 'Collège Greenwood',
  mockTermLabel: '2025/2026 — Trimestre 2',
  admissionIdLabel: 'Matricule',
  verifiedLabel: 'Vérifié — scannez pour confirmer sur elorgeschools.org/verify',
  coreFeaturesHeading: "Tout ce que fait vraiment un secrétariat scolaire, en une seule connexion.",
  coreFeatures: FR_CORE_FEATURES,
  globalKicker: 'Pas seulement le Nigeria',
  globalHeading: 'Conçu au Nigeria. Conçu pour fonctionner partout.',
  globalBody: "Le pays, la devise, le calendrier académique et la liste de matières de votre école vous appartiennent entièrement — rien ici ne suppose le système d'un seul pays. Une école, où qu'elle soit, configure son propre espace de travail et est facturée dans sa propre devise via Flutterwave.",
  dontSeeCountry: 'Vous ne voyez pas votre pays ?',
  talkToUs: 'Contactez-nous',
  addingCorridors: '— nous ajoutons des corridors au fur et à mesure des demandes des écoles.',
  sessionWrapKicker: "Bilan de l'année",
  sessionWrapHeading: "Une année de notes, transformée en point de départ pour une vraie conversation.",
  sessionWrapBody: "À la fin d'une année académique, Elorge examine dans quoi un élève a été constamment fort — pas un seul test chanceux, toute une année — et fait ressortir les filières à explorer en conséquence. Les suggestions de filières ne sont pas non plus figées sur un seul programme : une école enseignant des matières hors des valeurs par défaut peut lier les siennes pour obtenir les mêmes suggestions. Ce n'est pas un verdict, et nous le précisons partout : un point de départ pour une conversation parent-enseignant, pas un remplacement.",
  sessionWrapCardYear: '2025/2026',
  sessionWrapCardTerms: '3 trimestres enregistrés',
  fieldsWorthExploring: 'Filières à explorer',
  cbtKicker: 'Épreuves sur ordinateur',
  cbtHeading: "Pour les écoles avec un labo informatique — les questions à choix objectif se corrigent elles-mêmes.",
  cbtBody: "Constituez une banque de questions à la main, ou téléchargez un modèle, remplissez-le dans Excel hors ligne, puis importez-le en une fois. Publiez une épreuve avec une date programmée et un code d'accès communiqué oralement — les élèves se connectent avec leur seul matricule, aucun compte à créer. Les notes objectives sont corrigées instantanément ; un enseignant ajoute la note de théorie une fois les copies rendues, et le résultat combiné rejoint directement le même bulletin, protégé par le même code PIN parent. Aucun système séparé à consulter.",
  cbtFeatures: FR_CBT_FEATURES,
  lessonNotesKicker: 'Notes de cours',
  lessonNotesHeading: 'Écrites une fois, enseignées au tableau, relues à la maison.',
  lessonNotesBody: "Les enseignants rédigent dans un format structuré utilisé pour la supervision — objectifs, prérequis, présentation, évaluation, devoir. Un clic transforme la note en diaporama plein écran pour le projecteur, avec un tableau blanc superposé pour travailler un problème en direct. Publiez-la, et elle est là pour que les élèves de cette classe la relisent à la maison, à leur rythme — réservée à leur propre classe, pas à l'internet ouvert.",
  lessonNotesFeatures: FR_LESSON_NOTES_FEATURES,
  presentationLabel: 'Présentation',
  presentationSubject: 'Mathématiques — 4ème',
  presentationTitle: 'Résoudre pour x :',
  whiteboardActive: 'Tableau blanc actif',
  offlineKicker: 'Hors ligne d\'abord',
  offlineHeading: 'Inscrire un élève, saisir une note, passer une épreuve — sans aucun réseau.',
  offlineBody: "Le courant coupe en pleine saison d'inscription, ou le wifi du campus tombe sans prévenir. Elorge s'installe directement depuis votre navigateur, fonctionne comme une vraie application sur téléphone ou ordinateur, et continue de fonctionner pendant la coupure — en synchronisant tout dès votre retour en ligne.",
  financeKicker: "Au-delà de l'académique",
  financeHeading: 'Un service financier, intégré.',
  financeBody: "Définissez les frais d'un trimestre une fois, générez les factures pour chaque classe, et enregistrez les paiements dès leur arrivée — en espèces ou par virement, dans votre propre devise. Suivez les fournitures et équipements pour savoir avant la rupture de stock. Consultez revenus et dépenses pour n'importe quelle période, exportables vers Excel pour votre comptable.",
  financeFeatures: FR_FINANCE_FEATURES,
  operationsHeading: "L'intégration est rapide, même avec des centaines d'élèves déjà inscrits.",
  runSchoolFeatures: FR_RUN_SCHOOL_FEATURES,
  infrastructureKicker: 'Au-delà du logiciel',
  infrastructureHeading: "Elorge est aussi une entreprise d'infrastructure informatique — nous pouvons aussi vous aider côté matériel.",
  infrastructureBody: "La plateforme fonctionne que vous ayez ou non tout cela — mais si vous mettez en place des cartes d'identité, un labo informatique ou la présence au portail pour la première fois, nous pouvons vous orienter vers le bon équipement et vous aider à l'installer.",
  infrastructureFeatures: FR_INFRASTRUCTURE_FEATURES,
  interestedInThis: 'Intéressé par l\'un de ces éléments ?',
  advisePrefix: '— nous vous conseillerons sur ce qui convient réellement à votre école avant de recommander quoi que ce soit.',
  faqHeading: 'Questions fréquentes.',
  faqs: FR_FAQS,
  credibility: "Conçu pour les écoles qui prennent leurs dossiers au sérieux — des académies à campus unique aux collèges multi-sites, dans chaque pays où nous opérons.",
  finalCtaHeading: 'Prêt à le voir fonctionner avec vos propres données ?',
};

const PT_CORE_FEATURES = [
  { title: 'Resultados que se verificam a si próprios', body: 'Cada boletim tem um carimbo QR que um encarregado de educação pode digitalizar para confirmar a sua autenticidade — nunca mais duvidar de um certificado.' },
  { title: 'Cartões de identificação e presença no portão', body: 'Emita um cartão de identificação digital no dia em que o aluno é matriculado. Digitalize-o no portão — mesmo que não haja sinal nessa manhã.' },
  { title: 'Uma carteira, não três faturas', body: 'Carregue uma vez, na sua própria moeda. Os PINs de resultado e as provas baseadas em computador retiram da mesma cobrança por aluno — nunca cobrado duas vezes pelo mesmo aluno no mesmo período.' },
  { title: 'Um calendário que qualquer professor pode imprimir', body: 'Organize um período em minutos, e depois entregue a cada diretor de turma uma cópia imprimível — sem ter de reescrever as mesmas datas à mão.' },
];

const PT_CBT_FEATURES = [
  { title: 'Agendada, não em aberto', body: 'O código de acesso de uma prova só funciona no dia agendado, dentro de uma janela definida — não na semana seguinte, nem no mês seguinte.' },
  { title: 'Funciona mesmo que o laboratório perca o sinal', body: 'As respostas são guardadas primeiro no dispositivo e sincronizam assim que a ligação regressar — uma queda de rede nunca faz perder o progresso de um aluno.' },
  { title: 'Uma escola, sem laboratório necessário', body: 'As escolas sem um laboratório de informática completo continuam a inserir todas as notas à mão — nada aqui é obrigatório para usar o resto da plataforma.' },
];

const PT_LESSON_NOTES_FEATURES = [
  { title: 'Um formato que os professores já conhecem', body: 'Um formato estruturado de nota de aula — não uma caixa de texto em branco.' },
  { title: 'Um clique até ao projetor', body: 'A mesma nota transforma-se numa apresentação de diapositivos limpa e em ecrã inteiro — sem necessidade de construir diapositivos separados.' },
  { title: 'Quadro branco incorporado', body: 'Caneta, borracha e cores, diretamente sobre o diapositivo — para resolver um passo ao vivo.' },
];

const PT_FINANCE_FEATURES = [
  { title: 'Propinas e faturação', body: 'Gere faturas por turma e por período, registe pagamentos, e veja quem ainda deve num relance.' },
  { title: 'Inventário', body: 'Entradas e saídas de stock, com alertas automáticos de stock baixo antes de esgotar essenciais.' },
  { title: 'Contabilidade', body: 'Receitas e despesas, por categoria, para qualquer período — exportadas para Excel num clique.' },
];

const PT_RUN_SCHOOL_FEATURES = [
  { title: 'Importação de alunos em massa', body: 'Já tem 400 alunos em papel ou noutro sistema? Descarregue um modelo, preencha-o no Excel offline, e carregue-o — com retorno de erro linha a linha caso algo precise de correção.' },
  { title: 'Promoção de fim de ano letivo num clique', body: 'Passe toda uma turma para o ano seguinte em poucos cliques no final do ano, em vez de editar cada aluno um a um.' },
  { title: 'Convites ao pessoal, feitos como deve ser', body: 'Convide um professor por e-mail — ele define a sua própria palavra-passe para ativar a conta, ou um administrador pode definir uma diretamente com alteração obrigatória no primeiro início de sessão.' },
];

const PT_INFRASTRUCTURE_FEATURES = [
  { title: 'Impressão de cartões de identificação', body: 'Impressoras e cartões em branco para transformar os cartões de identificação digitais que já gera em cartões físicos.' },
  { title: 'Leitores no portão', body: 'Leitores de QR/código de barras adequados ao fluxo de presença, com um guia de instalação incluído.' },
  { title: 'Computadores para laboratório CBT', body: 'Equipamento de laboratório de gama de entrada dimensionado para provas baseadas em computador, para escolas ainda não totalmente equipadas.' },
  { title: 'Configuração de rede', body: 'Cablagem estruturada e routers para que a promessa de "funciona mesmo offline" se mantenha no wifi real do seu campus.' },
];

const PT_FAQS = [
  { q: 'Como é que um encarregado de educação consulta um resultado escolar online com a Elorge?', a: 'Um encarregado de educação visita a página de resultados da escola, insere o Número de Matrícula do aluno e um PIN de resultado emitido pela escola, e vê um boletim verificado e com carimbo QR — sem necessidade de conta.' },
  { q: 'A Elorge suporta provas baseadas em computador (CBT)?', a: 'Sim. As escolas com um laboratório de informática podem construir um banco de perguntas, publicar provas agendadas com um código de acesso comunicado oralmente, e as perguntas objetivas são corrigidas instantaneamente. As escolas sem laboratório podem dispensar completamente o CBT e inserir as notas à mão.' },
  { q: 'Os professores podem escrever e apresentar notas de aula na Elorge?', a: 'Sim. Os professores escrevem notas de aula num formato estruturado — objetivos, conhecimentos prévios, apresentação, avaliação, trabalho de casa — e depois transformam qualquer nota numa apresentação de diapositivos em ecrã inteiro para o projetor com um clique, com um quadro branco incorporado.' },
  { q: 'A Elorge funciona sem acesso à internet?', a: 'Sim. A Elorge pode ser instalada como aplicação no telemóvel ou computador e continua a funcionar durante cortes — matriculando alunos, inserindo notas, e realizando provas CBT offline — sincronizando tudo assim que a ligação regressar.' },
  { q: 'A Elorge é apenas para escolas na Nigéria?', a: 'Não. A Elorge começou na Nigéria e agora integra escolas em vários países, cada uma faturada na sua própria moeda através da Flutterwave — a estrutura académica da sua escola (períodos, semestres, ou trimestres) e a sua lista de disciplinas também são inteiramente suas, sem estarem fixas ao currículo de nenhum país específico.' },
  { q: 'Que calendário académico é que a Elorge assume — períodos, semestres, ou outra coisa?', a: 'O que a sua escola realmente utilizar. Uma escola pode funcionar com 2 semestres, 3 períodos, 4 trimestres, ou qualquer outra estrutura, e nomear os períodos como habitualmente faz — nada está fixo ao calendário académico de um único país.' },
];

const PT: HomeLabels = {
  kicker: 'Software de Gestão Escolar Elorge Technologies',
  heroTitle: 'Um registo que os seus pais não têm de acreditar apenas na sua palavra.',
  heroSubtitle: 'Resultados, cartões de identificação, presenças, propinas, provas baseadas em computador, e finanças escolares — num só lugar, a funcionar como a sua escola realmente funciona: às vezes com sinal, às vezes sem, onde quer que a sua escola esteja.',
  getStarted: 'Começar',
  signIn: 'Iniciar sessão',
  mockSchoolName: 'Colégio Greenwood',
  mockTermLabel: '2025/2026 — 2º Período',
  admissionIdLabel: 'Número de Matrícula',
  verifiedLabel: 'Verificado — digitalize para confirmar em elorgeschools.org/verify',
  coreFeaturesHeading: 'Tudo o que uma secretaria escolar realmente faz, num só início de sessão.',
  coreFeatures: PT_CORE_FEATURES,
  globalKicker: 'Não apenas a Nigéria',
  globalHeading: 'Construído na Nigéria. Construído para funcionar em qualquer lugar.',
  globalBody: 'O país, a moeda, o calendário académico e a lista de disciplinas da sua escola são inteiramente seus — nada aqui presume o sistema de um único país. Uma escola em qualquer lugar configura o seu próprio espaço de trabalho e é faturada na sua própria moeda através da Flutterwave.',
  dontSeeCountry: 'Não vê o seu país?',
  talkToUs: 'Fale connosco',
  addingCorridors: '— estamos a adicionar corredores à medida que as escolas os pedem.',
  sessionWrapKicker: 'Resumo do Ano Letivo',
  sessionWrapHeading: 'Um ano letivo de notas, transformado num ponto de partida para uma conversa a sério.',
  sessionWrapBody: 'No final de um ano letivo, a Elorge analisa aquilo em que um aluno foi consistentemente forte — não um único teste com sorte, um ano letivo inteiro — e destaca áreas que vale a pena explorar por causa disso. As sugestões de áreas profissionais também não estão fixas a um único currículo: uma escola que lecione disciplinas fora das predefinições incorporadas associa as suas próprias para obter as mesmas sugestões. Não é um veredicto, e dizemo-lo em todo o lado: um ponto de partida para uma conversa entre encarregados de educação e professores, não um substituto para ela.',
  sessionWrapCardYear: '2025/2026',
  sessionWrapCardTerms: '3 períodos registados',
  fieldsWorthExploring: 'Áreas que vale a pena explorar',
  cbtKicker: 'Provas baseadas em computador',
  cbtHeading: 'Para escolas com um laboratório de informática — as perguntas objetivas corrigem-se a si próprias.',
  cbtBody: 'Construa um banco de perguntas à mão, ou descarregue um modelo, preencha-o no Excel offline, e carregue-o de uma só vez. Publique uma prova com uma data agendada e um código de acesso comunicado oralmente — os alunos iniciam sessão apenas com o seu Número de Matrícula, sem contas a criar. As notas objetivas são corrigidas instantaneamente; um professor adiciona a nota da parte teórica assim que as submissões estejam concluídas, e o resultado combinado passa diretamente para o mesmo boletim, protegido pelo mesmo PIN do encarregado de educação. Nenhum sistema separado para consultar.',
  cbtFeatures: PT_CBT_FEATURES,
  lessonNotesKicker: 'Notas de aula',
  lessonNotesHeading: 'Escritas uma vez, ensinadas no quadro, lidas novamente em casa.',
  lessonNotesBody: 'Os professores escrevem num formato estruturado usado para supervisão — objetivos, conhecimentos prévios, apresentação, avaliação, trabalho de casa. Um clique transforma-a numa apresentação de diapositivos em ecrã inteiro para o projetor, com um quadro branco sobreposto para resolver um problema ao vivo. Publique-a, e ela fica disponível para os alunos dessa turma a lerem novamente em casa, ao seu próprio ritmo — restrita à sua própria turma, não à internet aberta.',
  lessonNotesFeatures: PT_LESSON_NOTES_FEATURES,
  presentationLabel: 'Apresentação',
  presentationSubject: 'Matemática — 8ª Classe',
  presentationTitle: 'Resolver para x:',
  whiteboardActive: 'Quadro branco ativo',
  offlineKicker: 'Offline em primeiro lugar',
  offlineHeading: 'Matricular um aluno, inserir uma nota, realizar uma prova — sem sinal nenhum.',
  offlineBody: 'A eletricidade falha a meio da época de matrículas, ou o wifi do campus cai sem aviso. A Elorge é instalável diretamente a partir do seu navegador, funciona como uma aplicação real no seu telemóvel ou computador, e continua a funcionar durante o corte — sincronizando tudo assim que estiver de volta.',
  financeKicker: 'Para além do académico',
  financeHeading: 'Uma secretaria financeira, incorporada.',
  financeBody: 'Defina as propinas de um período uma vez, gere faturas para cada turma, e registe os pagamentos à medida que chegam — em dinheiro ou por transferência, na sua própria moeda. Acompanhe materiais e equipamento para saber antes de esgotarem. Veja receitas contra despesas para qualquer intervalo de datas, exportável para Excel para o seu contabilista.',
  financeFeatures: PT_FINANCE_FEATURES,
  operationsHeading: 'A integração é rápida, mesmo com centenas de alunos já existentes.',
  runSchoolFeatures: PT_RUN_SCHOOL_FEATURES,
  infrastructureKicker: 'Para além do software',
  infrastructureHeading: 'A Elorge é também uma empresa de infraestrutura de TI — também podemos ajudar no lado do hardware.',
  infrastructureBody: 'A plataforma funciona quer tenha ou não tenha nada disto — mas se está a configurar cartões de identificação, um laboratório de informática, ou presença no portão pela primeira vez, podemos indicar-lhe o equipamento certo e ajudá-lo a configurá-lo.',
  infrastructureFeatures: PT_INFRASTRUCTURE_FEATURES,
  interestedInThis: 'Interessado em alguma coisa disto?',
  advisePrefix: '— iremos aconselhá-lo sobre o que realmente se adequa à sua escola antes de recomendar seja o que for.',
  faqHeading: 'Perguntas frequentes.',
  faqs: PT_FAQS,
  credibility: 'Construído para escolas que levam os seus registos a sério — de academias de campus único a colégios multi-filiais, em todos os países onde operamos.',
  finalCtaHeading: 'Pronto para ver isto a funcionar com os seus próprios dados?',
};

const ES_CORE_FEATURES = [
  { title: 'Resultados que se verifican solos', body: 'Cada boleta lleva un sello QR que un padre puede escanear para confirmar que es real; se acabó dudar de una constancia.' },
  { title: 'Carnés y asistencia en el portón', body: 'Emita un carné digital el día en que se matricula un alumno. Escanéelo en el portón, incluso si esa mañana no hay señal.' },
  { title: 'Una billetera, no tres facturas', body: 'Recargue una vez, en su propia moneda. Los PINs de resultado y los exámenes por computadora usan el mismo cargo por alumno; nunca se cobra dos veces al mismo alumno en el mismo trimestre.' },
  { title: 'Un calendario que cualquier docente puede imprimir', body: 'Arme un trimestre en minutos, y luego entregue a cada tutor/a de clase una copia imprimible; se acabó volver a escribir las mismas fechas a mano.' },
];

const ES_CBT_FEATURES = [
  { title: 'Programado, no abierto indefinidamente', body: 'El código de acceso de un examen solo funciona el día programado, dentro de una ventana definida; no la semana siguiente, ni el mes siguiente.' },
  { title: 'Funciona aunque el laboratorio pierda señal', body: 'Las respuestas se guardan primero en el dispositivo y se sincronizan en cuanto vuelve la conexión; una caída nunca hace perder el progreso de un alumno.' },
  { title: 'Un colegio, sin necesidad de laboratorio', body: 'Los colegios sin un laboratorio de computación completo igual ingresan cada calificación a mano; nada aquí es obligatorio para usar el resto de la plataforma.' },
];

const ES_LESSON_NOTES_FEATURES = [
  { title: 'Un formato que los docentes ya conocen', body: 'Un formato estructurado de nota de clase; no un simple cuadro de texto en blanco.' },
  { title: 'Un clic al proyector', body: 'La misma nota se convierte en una presentación de diapositivas limpia a pantalla completa; no hay que armar diapositivas por separado.' },
  { title: 'Pizarra integrada', body: 'Lápiz, borrador y colores, directamente sobre la diapositiva, para resolver un paso en vivo.' },
];

const ES_FINANCE_FEATURES = [
  { title: 'Cuotas y facturación', body: 'Genere facturas por clase y por trimestre, registre pagos, y vea de un vistazo quién todavía debe.' },
  { title: 'Inventario', body: 'Entradas y salidas de stock, con alertas automáticas de stock bajo antes de quedarse sin lo esencial.' },
  { title: 'Contabilidad', body: 'Ingresos y gastos, por categoría, para cualquier período; exportados a Excel en un clic.' },
];

const ES_RUN_SCHOOL_FEATURES = [
  { title: 'Importación masiva de alumnos', body: '¿Ya tiene 400 alumnos en papel o en otro sistema? Descargue una plantilla, complétela en Excel sin conexión, y súbala, con retroalimentación de errores fila por fila si algo necesita corrección.' },
  { title: 'Promoción de fin de año en un clic', body: 'Suba a toda una clase de grado en unos pocos clics al final del año, en lugar de editar a cada alumno uno por uno.' },
  { title: 'Invitaciones al personal, hechas correctamente', body: 'Invite a un docente por correo electrónico; establece su propia contraseña para activar la cuenta, o un administrador puede establecer una directamente con cambio obligatorio en el primer inicio de sesión.' },
];

const ES_INFRASTRUCTURE_FEATURES = [
  { title: 'Impresión de carnés', body: 'Impresoras y tarjetas en blanco para convertir los carnés digitales que ya genera en carnés físicos.' },
  { title: 'Lectores en el portón', body: 'Lectores de QR/código de barras adaptados al flujo de asistencia, con una guía de instalación incluida.' },
  { title: 'Computadoras para laboratorio de CBT', body: 'Equipo de laboratorio de nivel inicial dimensionado para exámenes por computadora, para colegios aún no totalmente equipados.' },
  { title: 'Configuración de red', body: 'Cableado estructurado y routers para que la promesa de "funciona incluso sin conexión" se cumpla en el wifi real de su campus.' },
];

const ES_FAQS = [
  { q: '¿Cómo consulta un padre un resultado escolar en línea con Elorge?', a: 'Un padre visita la página de resultados del colegio, ingresa el número de matrícula del alumno y un PIN de resultado emitido por el colegio, y ve una boleta verificada y con sello QR; no se necesita cuenta.' },
  { q: '¿Elorge admite exámenes por computadora (CBT)?', a: 'Sí. Los colegios con un laboratorio de computación pueden crear un banco de preguntas, publicar exámenes programados con un código de acceso que se comunica de forma oral, y las preguntas objetivas se califican al instante. Los colegios sin laboratorio pueden omitir el CBT por completo e ingresar las calificaciones a mano.' },
  { q: '¿Pueden los docentes escribir y presentar notas de clase en Elorge?', a: 'Sí. Los docentes escriben notas de clase en un formato estructurado (objetivos, conocimientos previos, presentación, evaluación, tarea) y luego convierten cualquier nota en una presentación de diapositivas a pantalla completa para el proyector con un clic, con una pizarra integrada.' },
  { q: '¿Elorge funciona sin acceso a internet?', a: 'Sí. Elorge se puede instalar como aplicación en el teléfono o la computadora y sigue funcionando durante los cortes: matriculando alumnos, ingresando calificaciones y presentando exámenes de CBT sin conexión, sincronizando todo en cuanto vuelve la conectividad.' },
  { q: '¿Elorge es solo para colegios en Nigeria?', a: 'No. Elorge comenzó en Nigeria y ahora incorpora colegios en varios países, cada uno facturado en su propia moneda a través de Flutterwave; la estructura académica de su colegio (trimestres, semestres, o bimestres) y su lista de asignaturas también son completamente suyas, sin estar fijadas al plan de estudios de un país en particular.' },
  { q: '¿Qué calendario académico asume Elorge: trimestres, semestres, u otra cosa?', a: 'El que su colegio realmente use. Un colegio puede funcionar con 2 semestres, 3 trimestres, 4 bimestres, o cualquier otra estructura, y nombrar los períodos como habitualmente lo hace; nada está fijado al calendario académico de un solo país.' },
];

const ES: HomeLabels = {
  kicker: 'Software de Gestión Escolar Elorge Technologies',
  heroTitle: 'Un registro que sus padres no tienen que creer solo por su palabra.',
  heroSubtitle: 'Resultados, carnés, asistencia, cuotas, exámenes por computadora y finanzas escolares, todo en un solo lugar, funcionando como realmente opera su colegio: a veces con señal, a veces sin ella, dondequiera que esté su colegio.',
  getStarted: 'Comenzar',
  signIn: 'Iniciar sesión',
  mockSchoolName: 'Colegio Greenwood',
  mockTermLabel: '2025/2026 — Trimestre 2',
  admissionIdLabel: 'Número de matrícula',
  verifiedLabel: 'Verificado — escanee para confirmar en elorgeschools.org/verify',
  coreFeaturesHeading: 'Todo lo que realmente hace una secretaría escolar, en un solo inicio de sesión.',
  coreFeatures: ES_CORE_FEATURES,
  globalKicker: 'No solo Nigeria',
  globalHeading: 'Construido en Nigeria. Construido para funcionar en cualquier lugar.',
  globalBody: 'El país, la moneda, el calendario académico y la lista de asignaturas de su colegio son completamente suyos; nada aquí supone el sistema de un solo país. Un colegio en cualquier lugar configura su propio espacio de trabajo y se factura en su propia moneda a través de Flutterwave.',
  dontSeeCountry: '¿No ve su país?',
  talkToUs: 'Escríbanos',
  addingCorridors: '— estamos agregando corredores a medida que los colegios los solicitan.',
  sessionWrapKicker: 'Resumen del Año Escolar',
  sessionWrapHeading: 'Un año de calificaciones, convertido en un punto de partida para una conversación real.',
  sessionWrapBody: 'Al final de un año académico, Elorge analiza en qué fue consistentemente fuerte un alumno (no un examen con suerte, todo un año) y destaca áreas que vale la pena explorar por eso. Las sugerencias de áreas profesionales tampoco están fijadas a un solo plan de estudios: un colegio que enseñe asignaturas fuera de los valores predeterminados incorporados vincula las suyas propias para obtener las mismas sugerencias. No es un veredicto, y lo decimos en cada texto: un punto de partida para una conversación entre padres y docentes, no un reemplazo de ella.',
  sessionWrapCardYear: '2025/2026',
  sessionWrapCardTerms: '3 trimestres registrados',
  fieldsWorthExploring: 'Áreas que vale la pena explorar',
  cbtKicker: 'Exámenes por computadora',
  cbtHeading: 'Para colegios con un laboratorio de computación: las preguntas objetivas se califican solas.',
  cbtBody: 'Cree un banco de preguntas a mano, o descargue una plantilla, complétela en Excel sin conexión, y súbala de una vez. Publique un examen con una fecha programada y un código de acceso que se comunica de forma oral; los alumnos inician sesión solo con su número de matrícula, sin cuentas que crear. Las calificaciones objetivas se corrigen al instante; un docente agrega la calificación de la parte teórica una vez que se completaron los envíos, y el resultado combinado va directo a la misma boleta, protegida por el mismo PIN del padre. Ningún sistema aparte que consultar.',
  cbtFeatures: ES_CBT_FEATURES,
  lessonNotesKicker: 'Notas de clase',
  lessonNotesHeading: 'Escritas una vez, enseñadas en el pizarrón, leídas de nuevo en casa.',
  lessonNotesBody: 'Los docentes escriben en un formato estructurado usado para la supervisión: objetivos, conocimientos previos, presentación, evaluación, tarea. Un clic la convierte en una presentación de diapositivas a pantalla completa para el proyector, con una pizarra superpuesta para resolver un problema en vivo. Publíquela, y quedará disponible para que los alumnos de esa clase la vuelvan a leer en casa, a su propio ritmo, restringida a su propia clase, no a internet abierto.',
  lessonNotesFeatures: ES_LESSON_NOTES_FEATURES,
  presentationLabel: 'Presentación',
  presentationSubject: 'Matemática — 2.º de secundaria',
  presentationTitle: 'Resolver para x:',
  whiteboardActive: 'Pizarra activa',
  offlineKicker: 'Sin conexión primero',
  offlineHeading: 'Matricular a un alumno, ingresar una calificación, presentar un examen, sin ninguna señal.',
  offlineBody: 'La electricidad se corta en plena temporada de matrículas, o el wifi del campus se cae sin aviso. Elorge se instala directamente desde su navegador, funciona como una aplicación real en su teléfono o computadora, y sigue funcionando durante el corte, sincronizando todo en cuanto vuelve la conexión.',
  financeKicker: 'Más allá de lo académico',
  financeHeading: 'Una oficina de finanzas, incorporada.',
  financeBody: 'Defina las cuotas de un trimestre una vez, genere facturas para cada clase, y registre los pagos a medida que llegan, en efectivo o por transferencia, en su propia moneda. Controle suministros y equipos para saber antes de que se agoten. Vea ingresos frente a gastos para cualquier rango de fechas, exportable a Excel para su contador.',
  financeFeatures: ES_FINANCE_FEATURES,
  operationsHeading: 'La incorporación es rápida, incluso con cientos de alumnos ya existentes.',
  runSchoolFeatures: ES_RUN_SCHOOL_FEATURES,
  infrastructureKicker: 'Más allá del software',
  infrastructureHeading: 'Elorge también es una empresa de infraestructura de TI: también podemos ayudar con el hardware.',
  infrastructureBody: 'La plataforma funciona tenga o no tenga nada de esto, pero si está configurando carnés, un laboratorio de computación, o asistencia en el portón por primera vez, podemos orientarlo hacia el equipo correcto y ayudarlo a instalarlo.',
  infrastructureFeatures: ES_INFRASTRUCTURE_FEATURES,
  interestedInThis: '¿Le interesa algo de esto?',
  advisePrefix: '— le aconsejaremos sobre lo que realmente se adapta a su colegio antes de recomendar nada.',
  faqHeading: 'Preguntas frecuentes.',
  faqs: ES_FAQS,
  credibility: 'Construido para colegios que toman en serio sus registros, desde academias de un solo campus hasta colegios con varias sedes, en todos los países donde operamos.',
  finalCtaHeading: '¿Listo para verlo funcionar con sus propios datos?',
};

const HOME_LABELS_BY_LOCALE: Record<SupportedLocale, HomeLabels> = {
  en: EN,
  fr: FR,
  pt: PT,
  es: ES,
};

export function homeLabelsFor(locale: string): HomeLabels {
  return HOME_LABELS_BY_LOCALE[locale as SupportedLocale] ?? HOME_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
