// web/lib/i18n/results-marketing-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface ResultsMarketingLabels {
  kicker: string;
  heroTitle: string;
  heroBody: string;
  noteBody: string;
  howItWorksHeading: string;
  howItWorks: { title: string; body: string }[];
  faqHeading: string;
  faqs: { q: string; a: string }[];
  ctaHeading: string;
  ctaBody: string;
  ctaButton: string;
}

const EN_HOW_IT_WORKS = [
  { title: "Go to your school's Elorge page", body: "Your school gives you a web address specific to them — something like elorgeschools.org/yourschool/results." },
  { title: 'Enter the Admission ID and result PIN', body: "Both are issued by the school. No account or password to create — just the two codes tied to your child's record." },
  { title: 'See a verified, QR-stamped report card', body: "Every result carries a QR code you or anyone else can scan to confirm it's the genuine record on file — not a doubtful photocopy." },
];

const FR_HOW_IT_WORKS = [
  { title: "Rendez-vous sur la page Elorge de votre école", body: "Votre école vous donne une adresse web qui lui est propre — quelque chose comme elorgeschools.org/votreecole/results." },
  { title: 'Saisissez le matricule et le code PIN de résultat', body: "Les deux sont délivrés par l'école. Aucun compte ni mot de passe à créer — juste les deux codes liés au dossier de votre enfant." },
  { title: 'Consultez un bulletin vérifié et estampillé QR', body: "Chaque résultat porte un code QR que vous ou n'importe qui pouvez scanner pour confirmer qu'il s'agit du dossier authentique — pas d'une photocopie douteuse." },
];

const EN_FAQS = [
  { q: "How do I check my child's school result online?", a: 'Your school provides a results link specific to them, plus an Admission ID and result PIN for your child. Enter both on that page to see a verified report card — no account needed.' },
  { q: 'What is a result PIN and where do I get one?', a: "A result PIN is a code your school issues per term to unlock a student's report card online. Contact your school's admin office if you don't have one." },
  { q: 'How can I tell if a result is genuine?', a: "Every Elorge report card carries a QR stamp. Scanning it confirms the result matches the record on file at the school — so a result can't be altered or faked after the fact." },
  { q: "My school isn't on Elorge yet — can I still check a result here?", a: "No — results are specific to each school's own Elorge workspace. If your school hasn't signed up, ask them, or share this page with your school's administration." },
];

const FR_FAQS = [
  { q: 'Comment vérifier le résultat scolaire de mon enfant en ligne ?', a: "Votre école fournit un lien de résultats qui lui est propre, ainsi qu'un matricule et un code PIN de résultat pour votre enfant. Saisissez les deux sur cette page pour voir un bulletin vérifié — aucun compte requis." },
  { q: "Qu'est-ce qu'un code PIN de résultat et où puis-je en obtenir un ?", a: "Un code PIN de résultat est un code que votre école délivre par trimestre pour déverrouiller le bulletin d'un élève en ligne. Contactez le secrétariat de votre école si vous n'en avez pas." },
  { q: "Comment savoir si un résultat est authentique ?", a: "Chaque bulletin Elorge porte un code QR. Le scanner confirme que le résultat correspond au dossier enregistré à l'école — un résultat ne peut donc pas être modifié ou falsifié après coup." },
  { q: "Mon école n'est pas encore sur Elorge — puis-je quand même vérifier un résultat ici ?", a: "Non — les résultats sont propres à l'espace de travail Elorge de chaque école. Si votre école ne s'est pas encore inscrite, demandez-lui, ou partagez cette page avec son administration." },
];

const EN: ResultsMarketingLabels = {
  kicker: 'Check a result',
  heroTitle: "A result you don't have to take anyone's word for.",
  heroBody: "Every report card issued through Elorge carries a QR stamp a parent can scan to confirm it's real. Here's how checking a result actually works.",
  noteBody: 'This page explains how result checking works — it isn\'t itself a results portal. Your specific school gives you a link like elorgeschools.org/yourschool/results, along with an Admission ID and PIN for your child.',
  howItWorksHeading: 'Three steps, no account required.',
  howItWorks: EN_HOW_IT_WORKS,
  faqHeading: 'Common questions about checking a result.',
  faqs: EN_FAQS,
  ctaHeading: 'Is your school on Elorge yet?',
  ctaBody: "If your school hasn't set up verified results, ID cards, and CBT yet, point them here.",
  ctaButton: 'Bring your school onto Elorge',
};

const FR: ResultsMarketingLabels = {
  kicker: 'Vérifier un résultat',
  heroTitle: "Un résultat que vous n'avez à croire sur la parole de personne.",
  heroBody: "Chaque bulletin délivré via Elorge porte un code QR qu'un parent peut scanner pour confirmer son authenticité. Voici comment fonctionne réellement la vérification d'un résultat.",
  noteBody: "Cette page explique comment fonctionne la vérification des résultats — elle n'est pas elle-même un portail de résultats. Votre école vous donne un lien du type elorgeschools.org/votreecole/results, ainsi qu'un matricule et un code PIN pour votre enfant.",
  howItWorksHeading: 'Trois étapes, aucun compte requis.',
  howItWorks: FR_HOW_IT_WORKS,
  faqHeading: 'Questions fréquentes sur la vérification d\'un résultat.',
  faqs: FR_FAQS,
  ctaHeading: 'Votre école est-elle déjà sur Elorge ?',
  ctaBody: "Si votre école n'a pas encore mis en place les résultats vérifiés, les cartes d'identité et le CBT, orientez-la ici.",
  ctaButton: 'Rejoindre Elorge avec votre école',
};

const PT_HOW_IT_WORKS = [
  { title: 'Aceda à página Elorge da sua escola', body: 'A sua escola fornece um endereço web específico para ela — algo como elorgeschools.org/asuaescola/results.' },
  { title: 'Insira o Número de Matrícula e o PIN de resultado', body: 'Ambos são emitidos pela escola. Sem conta nem palavra-passe a criar — apenas os dois códigos ligados ao registo do seu filho/a.' },
  { title: 'Veja um boletim verificado e com carimbo QR', body: 'Cada resultado tem um código QR que você ou qualquer outra pessoa pode digitalizar para confirmar que é o registo genuíno em arquivo — e não uma fotocópia duvidosa.' },
];

const PT_FAQS = [
  { q: 'Como consulto o resultado escolar do meu filho/a online?', a: 'A sua escola fornece um link de resultados específico, além de um Número de Matrícula e um PIN de resultado para o seu filho/a. Insira ambos nessa página para ver um boletim verificado — sem necessidade de conta.' },
  { q: 'O que é um PIN de resultado e onde o obtenho?', a: 'Um PIN de resultado é um código que a sua escola emite por período para desbloquear o boletim de um aluno online. Contacte a secretaria da sua escola se não tiver um.' },
  { q: 'Como sei se um resultado é genuíno?', a: 'Todo boletim Elorge tem um carimbo QR. Ao digitalizá-lo, confirma-se que o resultado corresponde ao registo em arquivo na escola — para que um resultado não possa ser alterado ou falsificado posteriormente.' },
  { q: 'A minha escola ainda não está na Elorge — posso mesmo assim consultar um resultado aqui?', a: 'Não — os resultados são específicos ao espaço de trabalho Elorge de cada escola. Se a sua escola ainda não aderiu, peça-lhe que o faça, ou partilhe esta página com a administração da sua escola.' },
];

const PT: ResultsMarketingLabels = {
  kicker: 'Consultar um resultado',
  heroTitle: 'Um resultado que não precisa de acreditar apenas na palavra de ninguém.',
  heroBody: 'Cada boletim emitido através da Elorge tem um carimbo QR que um encarregado de educação pode digitalizar para confirmar a sua autenticidade. Eis como funciona realmente a consulta de um resultado.',
  noteBody: 'Esta página explica como funciona a consulta de resultados — não é, em si, um portal de resultados. A sua escola específica fornece-lhe um link como elorgeschools.org/asuaescola/results, juntamente com um Número de Matrícula e um PIN para o seu filho/a.',
  howItWorksHeading: 'Três passos, sem necessidade de conta.',
  howItWorks: PT_HOW_IT_WORKS,
  faqHeading: 'Perguntas frequentes sobre a consulta de um resultado.',
  faqs: PT_FAQS,
  ctaHeading: 'A sua escola já está na Elorge?',
  ctaBody: 'Se a sua escola ainda não configurou resultados verificados, cartões de identificação e CBT, indique-lhes esta página.',
  ctaButton: 'Traga a sua escola para a Elorge',
};

const ES_HOW_IT_WORKS = [
  { title: 'Vaya a la página Elorge de su colegio', body: 'Su colegio le da una dirección web propia, algo como elorgeschools.org/sucolegio/results.' },
  { title: 'Ingrese el número de matrícula y el PIN de resultado', body: 'Ambos los emite el colegio. No hay que crear cuenta ni contraseña; solo los dos códigos vinculados al registro de su hijo/a.' },
  { title: 'Vea una boleta verificada y con sello QR', body: 'Cada resultado lleva un código QR que usted o cualquier otra persona puede escanear para confirmar que es el registro genuino en archivo, no una fotocopia dudosa.' },
];

const ES_FAQS = [
  { q: '¿Cómo consulto el resultado escolar de mi hijo/a en línea?', a: 'Su colegio le da un enlace de resultados propio, además de un número de matrícula y un PIN de resultado para su hijo/a. Ingrese ambos en esa página para ver una boleta verificada; no se necesita cuenta.' },
  { q: '¿Qué es un PIN de resultado y dónde lo consigo?', a: 'Un PIN de resultado es un código que su colegio emite cada trimestre para desbloquear la boleta de un alumno en línea. Comuníquese con la secretaría de su colegio si no tiene uno.' },
  { q: '¿Cómo sé si un resultado es genuino?', a: 'Cada boleta de Elorge lleva un sello QR. Al escanearlo se confirma que el resultado coincide con el registro en archivo del colegio, por lo que un resultado no puede alterarse ni falsificarse después.' },
  { q: 'Mi colegio aún no está en Elorge; ¿puedo consultar un resultado aquí de todos modos?', a: 'No: los resultados son específicos del espacio de trabajo Elorge de cada colegio. Si su colegio aún no se ha registrado, pídaselo, o comparta esta página con la administración de su colegio.' },
];

const ES: ResultsMarketingLabels = {
  kicker: 'Consultar un resultado',
  heroTitle: 'Un resultado que no tiene que creer solo por la palabra de alguien.',
  heroBody: 'Cada boleta emitida a través de Elorge lleva un sello QR que un padre puede escanear para confirmar que es real. Así es como funciona realmente la consulta de un resultado.',
  noteBody: 'Esta página explica cómo funciona la consulta de resultados; no es en sí un portal de resultados. Su colegio específico le da un enlace como elorgeschools.org/sucolegio/results, junto con un número de matrícula y un PIN para su hijo/a.',
  howItWorksHeading: 'Tres pasos, sin necesidad de cuenta.',
  howItWorks: ES_HOW_IT_WORKS,
  faqHeading: 'Preguntas frecuentes sobre la consulta de un resultado.',
  faqs: ES_FAQS,
  ctaHeading: '¿Su colegio ya está en Elorge?',
  ctaBody: 'Si su colegio aún no ha configurado resultados verificados, carnés y CBT, indíqueles esta página.',
  ctaButton: 'Sume a su colegio a Elorge',
};

const RESULTS_MARKETING_LABELS_BY_LOCALE: Record<SupportedLocale, ResultsMarketingLabels> = {
  en: EN,
  fr: FR,
  pt: PT,
  es: ES,
};

export function resultsMarketingLabelsFor(locale: string): ResultsMarketingLabels {
  return RESULTS_MARKETING_LABELS_BY_LOCALE[locale as SupportedLocale] ?? RESULTS_MARKETING_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
