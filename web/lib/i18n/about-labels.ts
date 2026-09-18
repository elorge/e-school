// web/lib/i18n/about-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface TeamMemberCopy {
  role: string;
  bio: string;
}

export interface AboutLabels {
  kicker: string;
  heroTitle: string;
  heroBody: string;
  whyWeExist: string;
  storyHeading: string;
  storyP1: string;
  storyP2: (countryCount: number) => string;
  inNumbers: string;
  stat1Body: string;
  stat2Body: string;
  stat3Body: string;
  valuesHeading: string;
  values: { title: string; body: string }[];
  teamKicker: string;
  teamHeading: string;
  linkedinAriaLabel: (name: string) => string;
  team: Record<string, TeamMemberCopy>;
  closingHeading: string;
  closingBody: string;
  talkToUs: string;
}

const EN_VALUES = [
  { title: 'Records worth trusting', body: "We started with a QR-verifiable report card for one reason: a parent shouldn't have to take a school's word for a result. Everything else we've built holds itself to that same standard." },
  { title: 'Built for how schools actually run', body: 'The power goes out mid-registration season. Signal drops at the gate. We designed for that reality first, not as an afterthought bolted on once something broke in front of a client — wherever the school happens to be.' },
  { title: 'A team that answers the phone', body: "We're a small, deliberately assembled team — education, engineering, security, and law all in the room — not a support queue. When a school writes in, someone who actually understands the platform responds." },
];

const FR_VALUES = [
  { title: 'Des dossiers dignes de confiance', body: "Nous avons commencé avec un bulletin vérifiable par QR pour une seule raison : un parent ne devrait pas avoir à croire une école sur parole pour un résultat. Tout ce que nous avons construit depuis respecte cette même exigence." },
  { title: 'Conçu pour le fonctionnement réel des écoles', body: "Le courant coupe en pleine saison d'inscription. Le réseau tombe au portail. Nous avons conçu pour cette réalité dès le départ, pas comme un correctif ajouté après coup devant un client — où que se trouve l'école." },
  { title: 'Une équipe qui répond au téléphone', body: "Nous sommes une petite équipe assemblée avec soin — éducation, ingénierie, sécurité et droit tous dans la même pièce — pas une file d'attente de support. Quand une école écrit, quelqu'un qui comprend vraiment la plateforme répond." },
];

const EN_TEAM: Record<string, TeamMemberCopy> = {
  'George Olumah': {
    role: 'Founder',
    bio: "George holds a BSc in Mathematics, a BASc in Software Development (in view) from BYU–Idaho, a project management qualification from UC Irvine, and studied Entrepreneurial Management at the Lagos Business School, Pan-Atlantic University. He built Elorge around a simple conviction: that a school's records — results, IDs, fees — deserve the same rigor as the classrooms producing them. He's happiest solving the unglamorous problem nobody else wanted to touch.",
  },
  'Elohor Olumah': {
    role: 'Co-Founder',
    bio: "Elohor holds a Master's in Engineering from the University of Benin. A deep, deliberate thinker, she brings a strategist's patience to problems most people want to rush past — tracing a decision back to its root before ever proposing a fix. That instinct shapes how Elorge is built: solid underneath, not just fast to ship.",
  },
  'Gordon Ekpuyama': {
    role: 'MD/CEO',
    bio: "Gordon holds a PhD in Education from the University of Ibadan. Few people building school software have spent as much time inside the actual dynamics of a Nigerian classroom, staffroom, and registrar's office — and it shows in how uncompromising he is about the platform reflecting how schools really work, not how software usually assumes they do.",
  },
  'Victor Oko': {
    role: 'CTO',
    bio: "Victor holds a Master's in Data Science and AI from the University of Hull. An AI software engineer with a deep understanding of core system architecture, he's the one responsible for Elorge working the way it's promised to — including offline, in a blackout, on a phone with three bars and no signal to spare.",
  },
  'Shelter Orok': {
    role: 'CISO',
    bio: "Shelter holds a Master's in Applied Cyber Security from Heriot-Watt University and has worked as a fraud prevention analyst. He's the reason a parent's PIN, a student's record, and a school's finances stay exactly as private as they're supposed to be — and the first person who'd tell you if they didn't.",
  },
  'Mamus Benita': {
    role: 'Legal Consultant',
    bio: "Mamus holds an LLM in Law from the University of Benin. She keeps Elorge's contracts, data-handling practices, and school agreements built on solid legal ground — so every school we work with knows exactly what they're signing, and exactly what we're accountable for.",
  },
};

const FR_TEAM: Record<string, TeamMemberCopy> = {
  'George Olumah': {
    role: 'Fondateur',
    bio: "George est titulaire d'une licence en mathématiques, prépare un diplôme en développement logiciel à BYU-Idaho, détient une qualification en gestion de projet de UC Irvine, et a étudié la gestion entrepreneuriale à la Lagos Business School (Pan-Atlantic University). Il a construit Elorge autour d'une conviction simple : les dossiers d'une école — résultats, cartes d'identité, frais — méritent la même rigueur que les salles de classe qui les produisent. Il est le plus heureux en résolvant le problème ingrat que personne d'autre ne voulait toucher.",
  },
  'Elohor Olumah': {
    role: 'Cofondatrice',
    bio: "Elohor est titulaire d'un master en ingénierie de l'Université de Bénin City. Penseuse profonde et méthodique, elle apporte la patience d'une stratège aux problèmes que la plupart des gens veulent expédier — remontant à la racine d'une décision avant même de proposer une solution. Cet instinct façonne la manière dont Elorge est construit : solide en profondeur, pas seulement rapide à livrer.",
  },
  'Gordon Ekpuyama': {
    role: 'DG/PDG',
    bio: "Gordon est titulaire d'un doctorat en éducation de l'Université d'Ibadan. Peu de personnes concevant des logiciels scolaires ont passé autant de temps au cœur des dynamiques réelles d'une salle de classe, d'une salle des professeurs et d'un secrétariat scolaire nigérians — et cela se voit dans son exigence que la plateforme reflète le fonctionnement réel des écoles, pas ce que les logiciels supposent habituellement.",
  },
  'Victor Oko': {
    role: 'Directeur technique',
    bio: "Victor est titulaire d'un master en science des données et IA de l'Université de Hull. Ingénieur logiciel en IA avec une compréhension approfondie de l'architecture système, c'est lui qui garantit qu'Elorge fonctionne comme promis — y compris hors ligne, en coupure de courant, sur un téléphone avec trois barres et pas de réseau à perdre.",
  },
  'Shelter Orok': {
    role: 'RSSI',
    bio: "Shelter est titulaire d'un master en cybersécurité appliquée de l'Université Heriot-Watt et a travaillé comme analyste en prévention de la fraude. C'est grâce à lui que le code PIN d'un parent, le dossier d'un élève et les finances d'une école restent exactement aussi privés qu'ils sont censés l'être — et il serait le premier à vous dire si ce n'était pas le cas.",
  },
  'Mamus Benita': {
    role: 'Conseillère juridique',
    bio: "Mamus est titulaire d'un LLM en droit de l'Université de Bénin City. Elle veille à ce que les contrats, les pratiques de traitement des données et les accords avec les écoles d'Elorge reposent sur des bases juridiques solides — pour que chaque école avec qui nous travaillons sache exactement ce qu'elle signe, et exactement de quoi nous sommes responsables.",
  },
};

const EN: AboutLabels = {
  kicker: 'About Elorge',
  heroTitle: "A record your parents don't have to take your word for.",
  heroBody: "Elorge Technologies Limited builds software for schools that take their records seriously — results parents can verify, ID cards that work at the gate, and a wallet that doesn't need a finance degree to understand, billed in your own currency wherever your school is.",
  whyWeExist: 'Why we exist',
  storyHeading: "We build the registrar's office nobody has time to build for themselves.",
  storyP1: "Elorge began with a single, stubborn question: why should a parent ever have to wonder if a report card is genuine? That question led to a QR-verifiable result — and once we'd solved it properly, it became obvious the same rigor was missing everywhere else in a school's daily record-keeping: at the gate, in the fees office, in a computer lab that loses signal mid-test.",
  storyP2: (countryCount) => `We started as a Nigerian software company focused on IT infrastructure and development for the education sector — and we're still headquartered there. What's changed is who we build for: schools in ${countryCount} countries now run on Elorge, each billed in its own currency, each keeping its own academic calendar and subject list. We're small enough that the people who built the platform still answer the phone when a school calls, and deliberate enough that every feature earns its place because a real registrar's office actually needed it.`,
  inNumbers: 'In numbers',
  stat1Body: 'login for results, IDs, fees, and testing — no separate systems to reconcile',
  stat2Body: 'signal required to register a student, enter a score, or sit a test',
  stat3Body: 'countries a school can sign up from today, each billed in its own currency',
  valuesHeading: 'What we hold ourselves to.',
  values: EN_VALUES,
  teamKicker: 'The people behind it',
  teamHeading: 'Education, engineering, security, and law — in the same room.',
  linkedinAriaLabel: (name) => `${name} on LinkedIn`,
  team: EN_TEAM,
  closingHeading: 'Want to talk to the team directly?',
  closingBody: "We're a small enough team that a real conversation is always on the table — before you sign up, not just after something goes wrong.",
  talkToUs: 'Talk to us',
};

const FR: AboutLabels = {
  kicker: 'À propos d\'Elorge',
  heroTitle: "Un dossier que vos parents n'ont pas à croire sur parole.",
  heroBody: "Elorge Technologies Limited conçoit des logiciels pour les écoles qui prennent leurs dossiers au sérieux — des résultats que les parents peuvent vérifier, des cartes d'identité qui fonctionnent au portail, et un portefeuille compréhensible sans diplôme de finance, facturé dans votre propre devise où que soit votre école.",
  whyWeExist: 'Pourquoi nous existons',
  storyHeading: "Nous construisons le secrétariat scolaire que personne n'a le temps de construire soi-même.",
  storyP1: "Elorge est né d'une seule question tenace : pourquoi un parent devrait-il jamais douter de l'authenticité d'un bulletin ? Cette question a mené à un résultat vérifiable par QR — et une fois ce problème correctement résolu, il est devenu évident que la même rigueur manquait partout ailleurs dans la gestion quotidienne des dossiers d'une école : au portail, au bureau des frais, dans un labo informatique qui perd le réseau en pleine épreuve.",
  storyP2: (countryCount) => `Nous avons démarré comme une entreprise de logiciels nigériane spécialisée dans l'infrastructure informatique et le développement pour le secteur éducatif — et notre siège y est toujours. Ce qui a changé, c'est pour qui nous construisons : des écoles dans ${countryCount} pays fonctionnent désormais sur Elorge, chacune facturée dans sa propre devise, chacune conservant son propre calendrier académique et sa liste de matières. Nous sommes assez petits pour que les personnes qui ont construit la plateforme répondent encore au téléphone quand une école appelle, et assez rigoureux pour que chaque fonctionnalité mérite sa place parce qu'un vrai secrétariat scolaire en avait réellement besoin.`,
  inNumbers: 'En chiffres',
  stat1Body: 'connexion pour les résultats, cartes d\'identité, frais et épreuves — aucun système séparé à réconcilier',
  stat2Body: 'réseau nécessaire pour inscrire un élève, saisir une note ou passer une épreuve',
  stat3Body: "pays depuis lesquels une école peut s'inscrire dès aujourd'hui, chacun facturé dans sa propre devise",
  valuesHeading: 'Ce à quoi nous nous tenons.',
  values: FR_VALUES,
  teamKicker: "Les personnes derrière tout ça",
  teamHeading: 'Éducation, ingénierie, sécurité et droit — dans la même pièce.',
  linkedinAriaLabel: (name) => `${name} sur LinkedIn`,
  team: FR_TEAM,
  closingHeading: "Envie de parler directement à l'équipe ?",
  closingBody: "Nous sommes une équipe assez petite pour qu'une vraie conversation soit toujours possible — avant votre inscription, pas seulement après qu'un problème survienne.",
  talkToUs: 'Contactez-nous',
};

const PT_VALUES = [
  { title: 'Registos merecedores de confiança', body: 'Começámos com um boletim verificável por QR por uma única razão: um encarregado de educação não devia ter de acreditar apenas na palavra de uma escola quanto a um resultado. Tudo o resto que construímos segue essa mesma exigência.' },
  { title: 'Construído para o funcionamento real das escolas', body: 'A eletricidade falha a meio da época de matrículas. O sinal cai no portão. Concebemos para essa realidade desde o início, não como um remendo acrescentado depois de algo falhar à frente de um cliente — onde quer que a escola esteja.' },
  { title: 'Uma equipa que atende o telefone', body: 'Somos uma equipa pequena, montada de forma deliberada — educação, engenharia, segurança e direito todos na mesma sala — não uma fila de suporte. Quando uma escola escreve, quem responde é alguém que compreende mesmo a plataforma.' },
];

const PT_TEAM: Record<string, TeamMemberCopy> = {
  'George Olumah': {
    role: 'Fundador',
    bio: 'George é licenciado em Matemática, está a concluir uma licenciatura em Desenvolvimento de Software na BYU–Idaho, tem uma qualificação em gestão de projetos da UC Irvine, e estudou Gestão Empresarial na Lagos Business School, Pan-Atlantic University. Construiu a Elorge em torno de uma convicção simples: os registos de uma escola — resultados, cartões de identificação, propinas — merecem o mesmo rigor que as salas de aula que os produzem. É mais feliz a resolver o problema pouco glamoroso que mais ninguém queria tocar.',
  },
  'Elohor Olumah': {
    role: 'Cofundadora',
    bio: 'Elohor tem um Mestrado em Engenharia pela Universidade do Benim. Pensadora profunda e deliberada, traz a paciência de uma estratega a problemas que a maioria das pessoas quer despachar depressa — traçando uma decisão até à sua origem antes de sequer propor uma solução. Esse instinto molda a forma como a Elorge é construída: sólida por dentro, não apenas rápida a lançar.',
  },
  'Gordon Ekpuyama': {
    role: 'Diretor-Geral/CEO',
    bio: 'Gordon tem um Doutoramento em Educação pela Universidade de Ibadan. Poucas pessoas a construir software escolar passaram tanto tempo dentro da dinâmica real de uma sala de aula, sala de professores e secretaria escolar — e isso nota-se na sua exigência de que a plataforma reflita como as escolas realmente funcionam, e não como o software normalmente presume que funcionam.',
  },
  'Victor Oko': {
    role: 'Diretor de Tecnologia (CTO)',
    bio: 'Victor tem um Mestrado em Ciência de Dados e IA pela Universidade de Hull. Engenheiro de software de IA com um profundo conhecimento de arquitetura de sistemas, é o responsável por a Elorge funcionar tal como prometido — incluindo offline, num corte de energia, num telemóvel com três barras e nenhum sinal a perder.',
  },
  'Shelter Orok': {
    role: 'Diretor de Segurança da Informação (CISO)',
    bio: 'Shelter tem um Mestrado em Cibersegurança Aplicada pela Heriot-Watt University e já trabalhou como analista de prevenção de fraude. É graças a ele que o PIN de um encarregado de educação, o registo de um aluno e as finanças de uma escola permanecem exatamente tão privados quanto deveriam ser — e seria o primeiro a dizer-lhe se não estivessem.',
  },
  'Mamus Benita': {
    role: 'Consultora Jurídica',
    bio: 'Mamus tem um LLM em Direito pela Universidade do Benim. Mantém os contratos, as práticas de tratamento de dados e os acordos com escolas da Elorge assentes em bases jurídicas sólidas — para que cada escola com quem trabalhamos saiba exatamente o que está a assinar, e exatamente do que somos responsáveis.',
  },
};

const PT: AboutLabels = {
  kicker: 'Sobre a Elorge',
  heroTitle: 'Um registo que os seus pais não têm de acreditar apenas na sua palavra.',
  heroBody: 'A Elorge Technologies Limited constrói software para escolas que levam os seus registos a sério — resultados que os encarregados de educação podem verificar, cartões de identificação que funcionam no portão, e uma carteira que não exige um diploma de finanças para compreender, faturada na sua própria moeda onde quer que a sua escola esteja.',
  whyWeExist: 'Porque existimos',
  storyHeading: 'Construímos a secretaria escolar que ninguém tem tempo de construir por si próprio.',
  storyP1: 'A Elorge começou com uma única pergunta teimosa: porque é que um encarregado de educação alguma vez teria de duvidar se um boletim é genuíno? Essa pergunta levou a um resultado verificável por QR — e assim que resolvemos isso devidamente, tornou-se óbvio que faltava o mesmo rigor em todo o resto da gestão diária dos registos de uma escola: no portão, na secretaria de propinas, num laboratório de informática que perde o sinal a meio de uma prova.',
  storyP2: (countryCount) => `Começámos como uma empresa de software focada em infraestrutura de TI e desenvolvimento para o setor educativo — e continuamos sediados lá. O que mudou foi para quem construímos: escolas em ${countryCount} países já funcionam com a Elorge, cada uma faturada na sua própria moeda, cada uma mantendo o seu próprio calendário académico e lista de disciplinas. Somos pequenos o suficiente para que as pessoas que construíram a plataforma ainda atendam o telefone quando uma escola liga, e deliberados o suficiente para que cada funcionalidade mereça o seu lugar porque uma secretaria escolar real precisava mesmo dela.`,
  inNumbers: 'Em números',
  stat1Body: 'início de sessão para resultados, cartões de identificação, propinas e provas — sem sistemas separados a reconciliar',
  stat2Body: 'sinal necessário para matricular um aluno, inserir uma nota, ou realizar uma prova',
  stat3Body: 'países a partir dos quais uma escola se pode inscrever hoje, cada um faturado na sua própria moeda',
  valuesHeading: 'Aquilo a que nos comprometemos.',
  values: PT_VALUES,
  teamKicker: 'As pessoas por trás disto',
  teamHeading: 'Educação, engenharia, segurança e direito — na mesma sala.',
  linkedinAriaLabel: (name) => `${name} no LinkedIn`,
  team: PT_TEAM,
  closingHeading: 'Quer falar diretamente com a equipa?',
  closingBody: 'Somos uma equipa pequena o suficiente para que uma conversa a sério esteja sempre disponível — antes de se inscrever, não apenas depois de algo correr mal.',
  talkToUs: 'Fale connosco',
};

const ABOUT_LABELS_BY_LOCALE: Record<SupportedLocale, AboutLabels> = {
  en: EN,
  fr: FR,
  pt: PT,
};

export function aboutLabelsFor(locale: string): AboutLabels {
  return ABOUT_LABELS_BY_LOCALE[locale as SupportedLocale] ?? ABOUT_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
