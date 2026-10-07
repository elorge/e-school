// web/lib/i18n/demo-labels.ts
import { SupportedLocale } from '../locale';

export interface DemoLabels {
  kicker: string;
  title: string;
  subtitle: string;
  bullets: string[];
  name: string;
  school: string;
  email: string;
  phone: string;
  country: string;
  selectCountry: string;
  date: string;
  timeOfDay: string;
  anyTime: string;
  morning: string;
  afternoon: string;
  evening: string;
  students: string;
  selectStudents: string;
  message: string;
  optional: string;
  submit: string;
  submitting: string;
  privacy: string;
  errName: string;
  errSchool: string;
  errEmail: string;
  errPhone: string;
  errCountry: string;
  errDate: string;
  errSend: string;
  successTitle: string;
  successBody: string;
  backHome: string;
  seePricing: string;
}

const EN: DemoLabels = {
  kicker: 'Book a demo',
  title: 'See Elorge Schools running for a school like yours.',
  subtitle: 'Tell us a little about your school and when suits you. We will email you to confirm a time.',
  bullets: [
    'A walkthrough with a member of our team',
    'Results, CBT, ID cards and fees, shown working',
    'Your questions answered for your country and your school',
  ],
  name: 'Your name', school: 'School name', email: 'Email address', phone: 'Phone number',
  country: 'Country', selectCountry: 'Select your country',
  date: 'Preferred date', timeOfDay: 'Preferred time of day', anyTime: 'Any time',
  morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening',
  students: 'Number of students', selectStudents: 'Select a range',
  message: 'Anything you would like us to cover?', optional: 'optional',
  submit: 'Request my demo', submitting: 'Sending…',
  privacy: 'We only use your details to arrange your demo.',
  errName: 'Please enter your name.', errSchool: 'Please enter your school name.',
  errEmail: 'Please enter a valid email address.', errPhone: 'Please enter a valid phone number.',
  errCountry: 'Please select your country.', errDate: 'Please choose a date that is today or later.',
  errSend: 'Could not send your request. Please try again.',
  successTitle: 'Thank you — your request is in.',
  successBody: 'We have emailed you a confirmation, and a member of our team will be in touch to confirm a time.',
  backHome: 'Back to homepage', seePricing: 'See pricing',
};

const FR: DemoLabels = {
  kicker: 'Réserver une démo',
  title: 'Voyez Elorge Schools à l\'œuvre dans une école comme la vôtre.',
  subtitle: 'Parlez-nous un peu de votre école et de vos disponibilités. Nous vous écrirons pour confirmer un créneau.',
  bullets: [
    'Une présentation avec un membre de notre équipe',
    'Résultats, épreuves sur ordinateur, cartes d\'identité et frais, en fonctionnement',
    'Vos questions traitées pour votre pays et votre école',
  ],
  name: 'Votre nom', school: 'Nom de l\'école', email: 'Adresse e-mail', phone: 'Numéro de téléphone',
  country: 'Pays', selectCountry: 'Sélectionnez votre pays',
  date: 'Date souhaitée', timeOfDay: 'Moment de la journée souhaité', anyTime: 'Peu importe',
  morning: 'Matin', afternoon: 'Après-midi', evening: 'Soir',
  students: 'Nombre d\'élèves', selectStudents: 'Choisissez une tranche',
  message: 'Y a-t-il un point que vous aimeriez aborder ?', optional: 'facultatif',
  submit: 'Demander ma démo', submitting: 'Envoi…',
  privacy: 'Vos informations servent uniquement à organiser votre démo.',
  errName: 'Veuillez saisir votre nom.', errSchool: 'Veuillez saisir le nom de votre école.',
  errEmail: 'Veuillez saisir une adresse e-mail valide.', errPhone: 'Veuillez saisir un numéro de téléphone valide.',
  errCountry: 'Veuillez sélectionner votre pays.', errDate: 'Veuillez choisir une date à partir d\'aujourd\'hui.',
  errSend: 'Envoi impossible. Veuillez réessayer.',
  successTitle: 'Merci — votre demande est bien reçue.',
  successBody: 'Nous vous avons envoyé une confirmation par e-mail, et un membre de notre équipe vous contactera pour confirmer un créneau.',
  backHome: 'Retour à l\'accueil', seePricing: 'Voir les tarifs',
};

const PT: DemoLabels = {
  kicker: 'Agendar demonstração',
  title: 'Veja a Elorge Schools a funcionar numa escola como a sua.',
  subtitle: 'Conte-nos um pouco sobre a sua escola e quando lhe convém. Enviaremos um e-mail para confirmar um horário.',
  bullets: [
    'Uma apresentação com um membro da nossa equipa',
    'Resultados, provas em computador, cartões de identificação e propinas, em funcionamento',
    'As suas dúvidas esclarecidas para o seu país e a sua escola',
  ],
  name: 'O seu nome', school: 'Nome da escola', email: 'Endereço de e-mail', phone: 'Número de telefone',
  country: 'País', selectCountry: 'Selecione o seu país',
  date: 'Data preferida', timeOfDay: 'Período preferido do dia', anyTime: 'Qualquer um',
  morning: 'Manhã', afternoon: 'Tarde', evening: 'Noite',
  students: 'Número de alunos', selectStudents: 'Selecione um intervalo',
  message: 'Há algo que gostaria que abordássemos?', optional: 'opcional',
  submit: 'Pedir a minha demonstração', submitting: 'A enviar…',
  privacy: 'Usamos os seus dados apenas para organizar a sua demonstração.',
  errName: 'Introduza o seu nome.', errSchool: 'Introduza o nome da escola.',
  errEmail: 'Introduza um e-mail válido.', errPhone: 'Introduza um número de telefone válido.',
  errCountry: 'Selecione o seu país.', errDate: 'Escolha uma data a partir de hoje.',
  errSend: 'Não foi possível enviar o pedido. Tente novamente.',
  successTitle: 'Obrigado — o seu pedido foi recebido.',
  successBody: 'Enviámos-lhe uma confirmação por e-mail e um membro da nossa equipa entrará em contacto para confirmar um horário.',
  backHome: 'Voltar à página inicial', seePricing: 'Ver preços',
};

const ES: DemoLabels = {
  kicker: 'Reservar una demostración',
  title: 'Vea Elorge Schools funcionando en un colegio como el suyo.',
  subtitle: 'Cuéntenos un poco sobre su colegio y cuándo le conviene. Le escribiremos para confirmar un horario.',
  bullets: [
    'Una presentación con un miembro de nuestro equipo',
    'Resultados, exámenes por computadora, carnés y cuotas, funcionando',
    'Sus preguntas respondidas para su país y su colegio',
  ],
  name: 'Su nombre', school: 'Nombre del colegio', email: 'Correo electrónico', phone: 'Número de teléfono',
  country: 'País', selectCountry: 'Seleccione su país',
  date: 'Fecha preferida', timeOfDay: 'Momento del día preferido', anyTime: 'Cualquiera',
  morning: 'Mañana', afternoon: 'Tarde', evening: 'Noche',
  students: 'Número de alumnos', selectStudents: 'Seleccione un rango',
  message: '¿Hay algo que le gustaría que tratemos?', optional: 'opcional',
  submit: 'Solicitar mi demostración', submitting: 'Enviando…',
  privacy: 'Solo usamos sus datos para organizar su demostración.',
  errName: 'Ingrese su nombre.', errSchool: 'Ingrese el nombre del colegio.',
  errEmail: 'Ingrese un correo válido.', errPhone: 'Ingrese un teléfono válido.',
  errCountry: 'Seleccione su país.', errDate: 'Elija una fecha de hoy en adelante.',
  errSend: 'No se pudo enviar la solicitud. Inténtelo de nuevo.',
  successTitle: 'Gracias — recibimos su solicitud.',
  successBody: 'Le enviamos una confirmación por correo y un miembro de nuestro equipo se pondrá en contacto para confirmar un horario.',
  backHome: 'Volver al inicio', seePricing: 'Ver precios',
};

const LABELS: Record<SupportedLocale, DemoLabels> = { en: EN, fr: FR, pt: PT, es: ES };
export function demoLabelsFor(locale: SupportedLocale): DemoLabels {
  return LABELS[locale] ?? EN;
}
