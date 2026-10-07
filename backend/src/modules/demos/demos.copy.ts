// backend/src/modules/demos/demos.copy.ts
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

interface Copy { subject: string; hello: (n: string) => string; body: string; summary: string; footer: string }
const COPY: Record<string, Copy> = {
  en: { subject: 'We received your Elorge Schools demo request', hello: (n) => `Hi ${n},`, body: 'Thanks for asking for a demo. A member of our team will email you to confirm a time.', summary: 'What you told us', footer: 'You are receiving this because you requested a demo on elorgeschools.org.' },
  fr: { subject: 'Nous avons reçu votre demande de démo Elorge Schools', hello: (n) => `Bonjour ${n},`, body: "Merci d'avoir demandé une démonstration. Un membre de notre équipe vous écrira pour confirmer un créneau.", summary: 'Ce que vous nous avez indiqué', footer: 'Vous recevez ce message car vous avez demandé une démo sur elorgeschools.org.' },
  pt: { subject: 'Recebemos o seu pedido de demonstração da Elorge Schools', hello: (n) => `Olá ${n},`, body: 'Obrigado por pedir uma demonstração. Um membro da nossa equipa enviará um e-mail para confirmar um horário.', summary: 'O que nos indicou', footer: 'Recebe este e-mail porque pediu uma demonstração em elorgeschools.org.' },
  es: { subject: 'Recibimos su solicitud de demostración de Elorge Schools', hello: (n) => `Hola ${n},`, body: 'Gracias por pedir una demostración. Un miembro de nuestro equipo le escribirá para confirmar un horario.', summary: 'Lo que nos indicó', footer: 'Recibe este correo porque solicitó una demostración en elorgeschools.org.' },
};

export function demoConfirmationEmail(p: { locale?: string; name: string; lines: string[] }) {
  const c = COPY[p.locale ?? 'en'] ?? COPY.en;
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#111">
<p>${esc(c.hello(p.name))}</p><p>${esc(c.body)}</p>
<p style="margin-top:20px;font-weight:bold">${esc(c.summary)}</p>
<ul style="padding-left:18px;color:#333">${p.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
<p style="font-size:12px;color:#777;margin-top:24px">${esc(c.footer)}</p></div>`;
  return { subject: c.subject, html };
}
