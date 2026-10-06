// web/lib/i18n/chat-labels.ts
import { SupportedLocale } from '../locale';

export interface ChatLabels {
  fab: string;
  openAria: string;
  title: string;
  subtitle: string;
  formIntro: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  selectCountry: string;
  otherCountry: string;
  message: string;
  startChat: string;
  starting: string;
  privacyNote: string;
  optional: string;
  contactHint: string;
  typeMessage: string;
  send: string;
  minimize: string;
  you: string;
  bot: string;
  team: string;
  errName: string;
  errEmail: string;
  errPhone: string;
  errCountry: string;
  errMessage: string;
  errSend: string;
  offlineTitle: string;
  offlineBody: string;
  emailUs: string;
  newChat: string;
}

const EN: ChatLabels = {
  fab: 'Chat with us',
  openAria: 'Open live chat',
  title: 'Elorge Schools',
  subtitle: 'Live chat · an agent will join shortly',
  formIntro: 'Tell us a little about you and an available agent will reply right here.',
  name: 'Your name',
  email: 'Email address',
  phone: 'Phone number',
  country: 'Country',
  selectCountry: 'Select your country',
  otherCountry: 'Other',
  message: 'How can we help?',
  startChat: 'Start chat',
  starting: 'Starting…',
  privacyNote: 'We only use your details to reply to you.',
  optional: 'optional',
  contactHint: 'Add an email or phone number so we can reach you if you leave this page.',
  typeMessage: 'Type your message…',
  send: 'Send',
  minimize: 'Minimise chat',
  you: 'You',
  bot: 'Elorge Bot',
  team: 'Elorge team',
  errName: 'Please enter your name.',
  errEmail: 'Please enter a valid email address.',
  errPhone: 'Please enter a valid phone number.',
  errCountry: 'Please select your country.',
  errMessage: 'Please write a message.',
  errSend: 'Could not send. Please try again.',
  offlineTitle: 'Live chat is unavailable right now',
  offlineBody: 'Please email us and we will get back to you:',
  emailUs: 'Email us',
  newChat: 'Start a new chat',
};

const FR: ChatLabels = {
  fab: 'Discuter avec nous',
  openAria: 'Ouvrir le chat en direct',
  title: 'Elorge Schools',
  subtitle: 'Chat en direct · un conseiller arrive',
  formIntro: 'Dites-nous quelques mots sur vous et un conseiller disponible vous répondra ici même.',
  name: 'Votre nom',
  email: 'Adresse e-mail',
  phone: 'Numéro de téléphone',
  country: 'Pays',
  selectCountry: 'Sélectionnez votre pays',
  otherCountry: 'Autre',
  message: 'Comment pouvons-nous vous aider ?',
  startChat: 'Démarrer le chat',
  starting: 'Démarrage…',
  privacyNote: 'Vos informations servent uniquement à vous répondre.',
  optional: 'facultatif',
  contactHint: 'Ajoutez un e-mail ou un téléphone pour que nous puissions vous joindre si vous quittez cette page.',
  typeMessage: 'Écrivez votre message…',
  send: 'Envoyer',
  minimize: 'Réduire le chat',
  you: 'Vous',
  bot: 'Bot Elorge',
  team: 'Équipe Elorge',
  errName: 'Veuillez saisir votre nom.',
  errEmail: 'Veuillez saisir une adresse e-mail valide.',
  errPhone: 'Veuillez saisir un numéro de téléphone valide.',
  errCountry: 'Veuillez sélectionner votre pays.',
  errMessage: 'Veuillez écrire un message.',
  errSend: "Envoi impossible. Veuillez réessayer.",
  offlineTitle: "Le chat en direct n'est pas disponible",
  offlineBody: 'Écrivez-nous par e-mail et nous vous répondrons :',
  emailUs: 'Nous écrire',
  newChat: 'Nouveau chat',
};

const PT: ChatLabels = {
  fab: 'Fale connosco',
  openAria: 'Abrir chat ao vivo',
  title: 'Elorge Schools',
  subtitle: 'Chat ao vivo · um agente já vai atender',
  formIntro: 'Conte-nos um pouco sobre si e um agente disponível responderá aqui mesmo.',
  name: 'O seu nome',
  email: 'Endereço de e-mail',
  phone: 'Número de telefone',
  country: 'País',
  selectCountry: 'Selecione o seu país',
  otherCountry: 'Outro',
  message: 'Como podemos ajudar?',
  startChat: 'Iniciar chat',
  starting: 'A iniciar…',
  privacyNote: 'Usamos os seus dados apenas para lhe responder.',
  optional: 'opcional',
  contactHint: 'Adicione um e-mail ou telefone para o podermos contactar se sair desta página.',
  typeMessage: 'Escreva a sua mensagem…',
  send: 'Enviar',
  minimize: 'Minimizar chat',
  you: 'Você',
  bot: 'Bot Elorge',
  team: 'Equipa Elorge',
  errName: 'Introduza o seu nome.',
  errEmail: 'Introduza um e-mail válido.',
  errPhone: 'Introduza um número de telefone válido.',
  errCountry: 'Selecione o seu país.',
  errMessage: 'Escreva uma mensagem.',
  errSend: 'Não foi possível enviar. Tente novamente.',
  offlineTitle: 'O chat ao vivo está indisponível',
  offlineBody: 'Envie-nos um e-mail e responderemos:',
  emailUs: 'Enviar e-mail',
  newChat: 'Novo chat',
};

const ES: ChatLabels = {
  fab: 'Chatea con nosotros',
  openAria: 'Abrir chat en vivo',
  title: 'Elorge Schools',
  subtitle: 'Chat en vivo · un agente se unirá pronto',
  formIntro: 'Cuéntenos un poco sobre usted y un agente disponible responderá aquí mismo.',
  name: 'Su nombre',
  email: 'Correo electrónico',
  phone: 'Número de teléfono',
  country: 'País',
  selectCountry: 'Seleccione su país',
  otherCountry: 'Otro',
  message: '¿Cómo podemos ayudarle?',
  startChat: 'Iniciar chat',
  starting: 'Iniciando…',
  privacyNote: 'Solo usamos sus datos para responderle.',
  optional: 'opcional',
  contactHint: 'Agregue un correo o teléfono para poder contactarle si abandona esta página.',
  typeMessage: 'Escriba su mensaje…',
  send: 'Enviar',
  minimize: 'Minimizar chat',
  you: 'Usted',
  bot: 'Bot Elorge',
  team: 'Equipo Elorge',
  errName: 'Ingrese su nombre.',
  errEmail: 'Ingrese un correo válido.',
  errPhone: 'Ingrese un teléfono válido.',
  errCountry: 'Seleccione su país.',
  errMessage: 'Escriba un mensaje.',
  errSend: 'No se pudo enviar. Inténtelo de nuevo.',
  offlineTitle: 'El chat en vivo no está disponible',
  offlineBody: 'Escríbanos por correo y le responderemos:',
  emailUs: 'Escribirnos',
  newChat: 'Nuevo chat',
};

const LABELS: Record<SupportedLocale, ChatLabels> = { en: EN, fr: FR, pt: PT, es: ES };
export function chatLabelsFor(locale: SupportedLocale): ChatLabels {
  return LABELS[locale] ?? EN;
}
