// backend/src/modules/chat/chat.copy.ts
// All automatic-reply wording lives here so it can be tuned in one place.
// Links use [label](/path) — the website widget renders them as in-site links
// and the email builder turns them into absolute URLs.
import { ChatLocale } from './chat.dto';

interface Copy {
  welcome: (name: string) => string;
  nudge: (name: string) => string;
  followUp: (name: string, email: string, phone: string) => string;
  emailSubject: string;
  emailIntro: (name: string, agent: string) => string;
  emailFooter: string;
}

const EXPLORE = {
  en: 'While you wait, have a look around: [Pricing](/pricing) · [CBT](/features/cbt) · [ID cards & attendance](/features/id-cards) · [Lesson notes](/features/lesson-notes) · [Check a result](/results)',
  fr: "En attendant, jetez un œil : [Tarifs](/pricing) · [Épreuves sur ordinateur](/features/cbt) · [Cartes d'identité](/features/id-cards) · [Notes de cours](/features/lesson-notes) · [Vérifier un résultat](/results)",
  pt: 'Enquanto espera, explore: [Preços](/pricing) · [Provas em computador](/features/cbt) · [Cartões de identificação](/features/id-cards) · [Planos de aula](/features/lesson-notes) · [Consultar um resultado](/results)',
  es: 'Mientras espera, explore: [Precios](/pricing) · [Exámenes por computadora](/features/cbt) · [Carnés y asistencia](/features/id-cards) · [Notas de clase](/features/lesson-notes) · [Consultar un resultado](/results)',
} as const;

const COPY: Record<ChatLocale, Copy> = {
  en: {
    welcome: (n) => `Hi ${n}! 👋 Thanks for reaching out to Elorge Schools. Please stay on this page — an available agent will be with you shortly.\n\n${EXPLORE.en}`,
    nudge: (n) => `Thanks for your patience, ${n}. Our agents are helping other schools right now, but your message is at the top of the list. Please stay on — we'll reply right here.\n\n${EXPLORE.en}`,
    followUp: (n, e, p) => {
      const via = e && p ? `email (${e}) or phone` : e ? `email (${e})` : p ? 'phone' : '';
      return via
        ? `Sorry for the wait, ${n} — we haven't been able to reach you in chat yet. We've kept your details, and an agent will reply by ${via} as soon as possible. You can safely close this window.`
        : `Sorry for the wait, ${n} — all our agents are busy right now. Please keep this page open and we'll reply here as soon as someone is free.`;
    },
    emailSubject: 'Elorge Schools replied to your message',
    emailIntro: (n, a) => `Hi ${n}, ${a} from Elorge Schools replied to your chat:`,
    emailFooter: 'You are receiving this because you started a chat on elorgeschools.org.',
  },
  fr: {
    welcome: (n) => `Bonjour ${n} ! 👋 Merci d'avoir contacté Elorge Schools. Restez sur cette page — un conseiller disponible va vous répondre très bientôt.\n\n${EXPLORE.fr}`,
    nudge: (n) => `Merci de votre patience, ${n}. Nos conseillers aident d'autres écoles en ce moment, mais votre message est en tête de liste. Restez connecté — nous répondrons ici même.\n\n${EXPLORE.fr}`,
    followUp: (n, e, p) => {
      const via = e && p ? `e-mail (${e}) ou téléphone` : e ? `e-mail (${e})` : p ? 'téléphone' : '';
      return via
        ? `Désolé pour l'attente, ${n} — nous n'avons pas pu vous répondre dans le chat. Nous avons conservé vos coordonnées et un conseiller vous répondra par ${via} dès que possible. Vous pouvez fermer cette fenêtre.`
        : `Désolé pour l'attente, ${n} — tous nos conseillers sont occupés. Gardez cette page ouverte : nous vous répondrons ici dès qu'un conseiller sera libre.`;
    },
    emailSubject: 'Elorge Schools a répondu à votre message',
    emailIntro: (n, a) => `Bonjour ${n}, ${a} d'Elorge Schools a répondu à votre message :`,
    emailFooter: "Vous recevez ce message car vous avez démarré une discussion sur elorgeschools.org.",
  },
  pt: {
    welcome: (n) => `Olá ${n}! 👋 Obrigado por contactar a Elorge Schools. Fique nesta página — um agente disponível falará consigo em breve.\n\n${EXPLORE.pt}`,
    nudge: (n) => `Obrigado pela paciência, ${n}. Os nossos agentes estão a ajudar outras escolas neste momento, mas a sua mensagem está no topo da lista. Fique por aqui — responderemos neste chat.\n\n${EXPLORE.pt}`,
    followUp: (n, e, p) => {
      const via = e && p ? `e-mail (${e}) ou telefone` : e ? `e-mail (${e})` : p ? 'telefone' : '';
      return via
        ? `Desculpe a demora, ${n} — ainda não conseguimos responder no chat. Guardámos os seus dados e um agente responderá por ${via} assim que possível. Pode fechar esta janela.`
        : `Desculpe a demora, ${n} — todos os nossos agentes estão ocupados. Mantenha esta página aberta: responderemos aqui assim que alguém estiver livre.`;
    },
    emailSubject: 'A Elorge Schools respondeu à sua mensagem',
    emailIntro: (n, a) => `Olá ${n}, ${a} da Elorge Schools respondeu ao seu chat:`,
    emailFooter: 'Recebe este e-mail porque iniciou um chat em elorgeschools.org.',
  },
  es: {
    welcome: (n) => `¡Hola ${n}! 👋 Gracias por escribir a Elorge Schools. Permanezca en esta página — un agente disponible le atenderá en breve.\n\n${EXPLORE.es}`,
    nudge: (n) => `Gracias por su paciencia, ${n}. Nuestros agentes están atendiendo a otros colegios, pero su mensaje está al principio de la lista. Permanezca aquí — responderemos en este chat.\n\n${EXPLORE.es}`,
    followUp: (n, e, p) => {
      const via = e && p ? `correo (${e}) o teléfono` : e ? `correo (${e})` : p ? 'teléfono' : '';
      return via
        ? `Disculpe la espera, ${n} — aún no hemos podido responderle en el chat. Guardamos sus datos y un agente le responderá por ${via} lo antes posible. Puede cerrar esta ventana.`
        : `Disculpe la espera, ${n} — todos nuestros agentes están ocupados. Mantenga esta página abierta: responderemos aquí en cuanto alguien esté libre.`;
    },
    emailSubject: 'Elorge Schools respondió a su mensaje',
    emailIntro: (n, a) => `Hola ${n}, ${a} de Elorge Schools respondió a su chat:`,
    emailFooter: 'Recibe este correo porque inició un chat en elorgeschools.org.',
  },
};

export function chatCopy(locale?: string): Copy {
  return COPY[(locale as ChatLocale) in COPY ? (locale as ChatLocale) : 'en'];
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Builds the "an agent replied while you were away" email. */
export function agentReplyEmail(p: { locale?: string; name: string; agent: string; text: string; siteUrl: string }) {
  const c = chatCopy(p.locale);
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#111">
<p>${esc(c.emailIntro(p.name, p.agent))}</p>
<blockquote style="margin:16px 0;padding:12px 16px;background:#f3f6fb;border-left:4px solid #0B3D91;white-space:pre-wrap">${esc(p.text)}</blockquote>
<p><a href="${p.siteUrl}/contact" style="color:#0B3D91">elorgeschools.org</a></p>
<p style="font-size:12px;color:#777">${esc(c.emailFooter)}</p></div>`;
  return { subject: c.emailSubject, html };
}
