export type RoomLayoutCapacities = {
  u?: number | null;
  meeting?: number | null;
  conference?: number | null;
  classroom?: number | null;
  banquet?: number | null;
  cocktail?: number | null;
};

export type RoomExtendedDetails = {
  summary?: string;
  images?: { src: string; alt: string }[];
  features?: { label: string; value: string }[];
  layoutCapacities?: RoomLayoutCapacities;
  pricing?: { label: string; value: string }[];
};

const auditoriumDetails: RoomExtendedDetails = {
  summary:
    "Grand auditorium modulable sur plusieurs niveaux, équipé d'une scène professionnelle, d'un mur LED géant et d'une régie lumière/son. Idéal pour conférences, concerts et grands événements.",
  images: [
    {
      src: "/rooms/auditorium/01-vue-scene.png",
      alt: "Vue de la scène avec mur LED et éclairage professionnel",
    },
    {
      src: "/rooms/auditorium/02-vue-ensemble.png",
      alt: "Vue d'ensemble de l'auditorium et des gradins",
    },
    {
      src: "/rooms/auditorium/03-salle-pleine.png",
      alt: "Auditorium en configuration conférence",
    },
    {
      src: "/rooms/auditorium/04-scene-spectacle.png",
      alt: "Scène en configuration spectacle",
    },
  ],
  features: [
    { label: "Événements acceptés", value: "Privés et professionnels" },
    { label: "Scène", value: "Oui (400 m²)" },
    { label: "Piste de danse", value: "Non" },
    { label: "Lumière naturelle", value: "Non" },
    { label: "Climatisation", value: "Oui" },
    { label: "Chauffage", value: "Oui" },
    { label: "Accès handicapé (PMR)", value: "Oui" },
    { label: "Manifestations dansantes", value: "Oui" },
    { label: "Disponibilité de l'espace", value: "Tous les jours" },
  ],
  layoutCapacities: {
    u: null,
    meeting: 3500,
    conference: 3500,
    classroom: null,
    banquet: null,
    cocktail: null,
  },
};

const diamantDetails: RoomExtendedDetails = {
  summary:
    "Salle polyvalente modulable de 500 m², équipée d'une scène professionnelle, d'un mur LED et d'une régie lumière/son. Configurations conférence, banquet ou cocktail jusqu'à 500 personnes.",
  images: [
    {
      src: "/rooms/diamant/01-scene.png",
      alt: "Scène avec éclairage professionnel et instruments",
    },
    {
      src: "/rooms/diamant/02-conference.png",
      alt: "Configuration conférence avec mur LED",
    },
    {
      src: "/rooms/diamant/03-evenement.png",
      alt: "Événement debout avec régie son",
    },
    {
      src: "/rooms/diamant/04-banquet.png",
      alt: "Configuration banquet avec tables rondes",
    },
  ],
  features: [
    { label: "Événements acceptés", value: "Privés et professionnels" },
    { label: "Scène", value: "Non" },
    { label: "Piste de danse", value: "Non" },
    { label: "Lumière naturelle", value: "Non" },
    { label: "Climatisation", value: "Oui" },
    { label: "Chauffage", value: "Oui" },
    { label: "Accès handicapé (PMR)", value: "Oui" },
    { label: "Manifestations dansantes", value: "Oui" },
    { label: "Disponibilité de l'espace", value: "Tous les jours" },
  ],
  layoutCapacities: {
    u: 150,
    meeting: 500,
    conference: 500,
    classroom: 300,
    banquet: 330,
    cocktail: 500,
  },
  pricing: [
    { label: "Tarif de l'espace", value: "Dès 3 500 €" },
    { label: "Heure supplémentaire", value: "850 €" },
  ],
};

const sardoineDetails: RoomExtendedDetails = {
  summary:
    "Salle polyvalente lumineuse de 200 m² avec lumière naturelle, configuration théâtre ou réunion jusqu'à 200 personnes. Idéale pour séminaires, formations et présentations.",
  images: [
    {
      src: "/rooms/sardoine/01-conference.png",
      alt: "Configuration conférence en rangées avec vidéoprojecteur",
    },
  ],
  features: [
    { label: "Événements acceptés", value: "Privés et professionnels" },
    { label: "Scène", value: "Non" },
    { label: "Piste de danse", value: "Non" },
    { label: "Lumière naturelle", value: "Oui" },
    { label: "Climatisation", value: "Oui" },
    { label: "Chauffage", value: "Oui" },
    { label: "Accès handicapé (PMR)", value: "Oui" },
    { label: "Manifestations dansantes", value: "Oui" },
    { label: "Disponibilité de l'espace", value: "Tous les jours" },
  ],
  layoutCapacities: {
    u: 80,
    meeting: 200,
    conference: 200,
    classroom: 150,
    banquet: 100,
    cocktail: 180,
  },
  pricing: [
    { label: "Tarif de l'espace", value: "Dès 1 500 €" },
    { label: "Heure supplémentaire", value: "300 €" },
  ],
};

const saphirDetails: RoomExtendedDetails = {
  summary:
    "Salle polyvalente de 200 m² avec lumière naturelle et panneaux acoustiques décoratifs. Configurations conférence, banquet ou cocktail jusqu'à 200 personnes.",
  images: [
    {
      src: "/rooms/saphir/01-conference.png",
      alt: "Configuration conférence avec écran de projection",
    },
    {
      src: "/rooms/saphir/02-banquet.png",
      alt: "Configuration banquet avec tables rondes",
    },
  ],
  features: [
    { label: "Événements acceptés", value: "Privés et professionnels" },
    { label: "Scène", value: "Non" },
    { label: "Piste de danse", value: "Non" },
    { label: "Lumière naturelle", value: "Oui" },
    { label: "Climatisation", value: "Oui" },
    { label: "Chauffage", value: "Oui" },
    { label: "Accès handicapé (PMR)", value: "Oui" },
    { label: "Manifestations dansantes", value: "Oui" },
    { label: "Disponibilité de l'espace", value: "Tous les jours" },
  ],
  layoutCapacities: {
    u: 80,
    meeting: 200,
    conference: 200,
    classroom: 150,
    banquet: 100,
    cocktail: 180,
  },
  pricing: [
    { label: "Tarif de l'espace", value: "Dès 1 500 €" },
    { label: "Heure supplémentaire", value: "300 €" },
  ],
};

const topazeDetails: RoomExtendedDetails = {
  summary:
    "Grande salle polyvalente de 400 m² avec lumière naturelle et éclairage d'ambiance modulable. Banquet, conférence ou cocktail jusqu'à 400 personnes.",
  images: [
    {
      src: "/rooms/topaze/01-banquet.png",
      alt: "Configuration banquet avec éclairage d'ambiance",
    },
  ],
  features: [
    { label: "Événements acceptés", value: "Privés et professionnels" },
    { label: "Scène", value: "Non" },
    { label: "Piste de danse", value: "Non" },
    { label: "Lumière naturelle", value: "Oui" },
    { label: "Climatisation", value: "Oui" },
    { label: "Chauffage", value: "Oui" },
    { label: "Accès handicapé (PMR)", value: "Oui" },
    { label: "Manifestations dansantes", value: "Oui" },
    { label: "Disponibilité de l'espace", value: "Tous les jours" },
  ],
  layoutCapacities: {
    u: 160,
    meeting: 400,
    conference: 400,
    classroom: 280,
    banquet: 200,
    cocktail: 260,
  },
  pricing: [
    { label: "Tarif de l'espace", value: "Dès 2 000 €" },
    { label: "Heure supplémentaire", value: "600 €" },
    { label: "Caution", value: "Pas de caution demandée" },
    { label: "Acompte", value: "30 % du montant total" },
  ],
};

const orDetails: RoomExtendedDetails = {
  summary:
    "Salle polyvalente de 200 m² avec lumière naturelle et panneaux acoustiques colorés. Configuration théâtre ou réunion jusqu'à 200 personnes.",
  images: [
    {
      src: "/rooms/or/01-conference.png",
      alt: "Configuration conférence avec écran de projection",
    },
  ],
  features: [
    { label: "Événements acceptés", value: "Privés et professionnels" },
    { label: "Scène", value: "Non" },
    { label: "Piste de danse", value: "Non" },
    { label: "Lumière naturelle", value: "Oui" },
    { label: "Climatisation", value: "Oui" },
    { label: "Chauffage", value: "Oui" },
    { label: "Accès handicapé (PMR)", value: "Oui" },
    { label: "Manifestations dansantes", value: "Oui" },
    { label: "Disponibilité de l'espace", value: "Tous les jours" },
  ],
  layoutCapacities: {
    u: 80,
    meeting: 200,
    conference: 200,
    classroom: 150,
    banquet: 100,
    cocktail: 180,
  },
  pricing: [
    { label: "Tarif de l'espace", value: "Dès 1 500 €" },
    { label: "Heure supplémentaire", value: "600 €" },
    { label: "Caution", value: "Pas de caution demandée" },
    { label: "Acompte", value: "30 % du montant total" },
  ],
};

const emeraudeDetails: RoomExtendedDetails = {
  summary:
    "Salon lounge de 60 m², lumineux avec grandes baies vitrées. Canapés modulables, écran TV et espace convivial pour réunions informelles ou petits comités jusqu'à 40 personnes.",
  images: [
    {
      src: "/rooms/emeraude/01-salon-tv.png",
      alt: "Salon avec canapés et écran TV intégré",
    },
    {
      src: "/rooms/emeraude/02-salon-fenetres.png",
      alt: "Espace lounge face aux baies vitrées",
    },
  ],
  features: [
    { label: "Événements acceptés", value: "Privés et professionnels" },
    { label: "Scène", value: "Non" },
    { label: "Piste de danse", value: "Non" },
    { label: "Lumière naturelle", value: "Oui" },
    { label: "Climatisation", value: "Oui" },
    { label: "Chauffage", value: "Oui" },
    { label: "Accès handicapé (PMR)", value: "Oui" },
    { label: "Manifestations dansantes", value: "Oui" },
    { label: "Disponibilité de l'espace", value: "Tous les jours" },
  ],
  layoutCapacities: {
    u: 20,
    meeting: 40,
    conference: null,
    classroom: 20,
    banquet: 30,
    cocktail: 40,
  },
  pricing: [
    { label: "Tarif de l'espace", value: "Dès 390 €" },
    { label: "Caution", value: "Pas de caution demandée" },
    { label: "Acompte", value: "30 % du montant total" },
  ],
};

const escarboucleDetails: RoomExtendedDetails = {
  summary:
    "Salon de réunion de 50 m², lumineux avec baies vitrées. Grande table de conférence avec prises intégrées, idéal pour comités et réunions jusqu'à 20 personnes.",
  images: [
    {
      src: "/rooms/escarboucle/01-reunion.png",
      alt: "Table de réunion face aux baies vitrées",
    },
  ],
  features: [
    { label: "Événements acceptés", value: "Privés et professionnels" },
    { label: "Scène", value: "Non" },
    { label: "Piste de danse", value: "Non" },
    { label: "Lumière naturelle", value: "Oui" },
    { label: "Climatisation", value: "Oui" },
    { label: "Chauffage", value: "Oui" },
    { label: "Accès handicapé (PMR)", value: "Oui" },
    { label: "Manifestations dansantes", value: "Oui" },
    { label: "Disponibilité de l'espace", value: "Tous les jours" },
  ],
  layoutCapacities: {
    u: null,
    meeting: 20,
    conference: null,
    classroom: null,
    banquet: null,
    cocktail: null,
  },
  pricing: [
    { label: "Tarif de l'espace", value: "Dès 330 €" },
    { label: "Caution", value: "Pas de caution demandée" },
    { label: "Acompte", value: "30 % du montant total" },
  ],
};

const sardiusDetails: RoomExtendedDetails = {
  summary:
    "Salon de réunion de 40 m², lumineux avec baies vitrées. Table de conférence avec prises intégrées, configurations multiples jusqu'à 30 personnes en cocktail.",
  images: [
    {
      src: "/rooms/sardius/01-reunion.png",
      alt: "Table de réunion face aux baies vitrées",
    },
  ],
  features: [
    { label: "Événements acceptés", value: "Privés et professionnels" },
    { label: "Scène", value: "Non" },
    { label: "Piste de danse", value: "Non" },
    { label: "Lumière naturelle", value: "Oui" },
    { label: "Climatisation", value: "Oui" },
    { label: "Chauffage", value: "Oui" },
    { label: "Accès handicapé (PMR)", value: "Oui" },
    { label: "Manifestations dansantes", value: "Oui" },
    { label: "Disponibilité de l'espace", value: "Tous les jours" },
  ],
  layoutCapacities: {
    u: 15,
    meeting: 20,
    conference: 20,
    classroom: 15,
    banquet: 24,
    cocktail: 30,
  },
  pricing: [
    { label: "Tarif de l'espace", value: "Dès 260 €" },
    { label: "Caution", value: "Pas de caution demandée" },
    { label: "Acompte", value: "30 % du montant total" },
  ],
};

const sardonyxDetails: RoomExtendedDetails = {
  summary:
    "Petit salon de réunion de 30 m², climatisé et accessible PMR. Espace intime pour comités et réunions jusqu'à 12 personnes.",
  features: [
    { label: "Événements acceptés", value: "Privés et professionnels" },
    { label: "Scène", value: "Non" },
    { label: "Piste de danse", value: "Non" },
    { label: "Lumière naturelle", value: "Non" },
    { label: "Climatisation", value: "Oui" },
    { label: "Chauffage", value: "Oui" },
    { label: "Accès handicapé (PMR)", value: "Oui" },
    { label: "Manifestations dansantes", value: "Oui" },
    { label: "Disponibilité de l'espace", value: "Tous les jours" },
  ],
  layoutCapacities: {
    u: null,
    meeting: 12,
    conference: null,
    classroom: null,
    banquet: null,
    cocktail: null,
  },
  pricing: [
    { label: "Tarif de l'espace", value: "Dès 200 €" },
    { label: "Caution", value: "Pas de caution demandée" },
    { label: "Acompte", value: "30 % du montant total" },
  ],
};

const studioCommonFeatures = [
  { label: "Événements acceptés", value: "Privés et professionnels" },
  { label: "Scène", value: "Non" },
  { label: "Piste de danse", value: "Non" },
  { label: "Lumière naturelle", value: "Oui" },
  { label: "Climatisation", value: "Oui" },
  { label: "Chauffage", value: "Oui" },
  { label: "Accès handicapé (PMR)", value: "Oui" },
  { label: "Manifestations dansantes", value: "Oui" },
  { label: "Disponibilité de l'espace", value: "Tous les jours" },
] as const;

const studioQuotePricing = [
  { label: "Tarif de l'espace", value: "Sur devis" },
  { label: "Caution", value: "Pas de caution demandée" },
  { label: "Acompte", value: "30 % du montant total" },
];

const plateauTvFondVertDetails: RoomExtendedDetails = {
  summary:
    "Studio TV avec fond vert de 50 m², lumineux et équipé pour tournages et incrustations. Jusqu'à 10 personnes en configuration réunion.",
  features: [...studioCommonFeatures],
  layoutCapacities: {
    u: null,
    meeting: 10,
    conference: null,
    classroom: null,
    banquet: null,
    cocktail: null,
  },
  pricing: studioQuotePricing,
};

const debatTvTableRondeDetails: RoomExtendedDetails = {
  summary:
    "Studio débat TV avec table ronde de 30 m², conçu pour émissions et interviews. Jusqu'à 7 personnes autour de la table.",
  features: [...studioCommonFeatures],
  layoutCapacities: {
    u: null,
    meeting: 7,
    conference: null,
    classroom: null,
    banquet: null,
    cocktail: null,
  },
  pricing: studioQuotePricing,
};

const enregistrementAudioDetails: RoomExtendedDetails = {
  summary:
    "Studio d'enregistrement audio de 40 m², insonorisé et équipé pour podcasts, voix off et captations sonores. Jusqu'à 10 personnes.",
  features: [...studioCommonFeatures],
  layoutCapacities: {
    u: null,
    meeting: 10,
    conference: null,
    classroom: null,
    banquet: null,
    cocktail: null,
  },
  pricing: studioQuotePricing,
};

const espaceEnfantsPricing = [
  { label: "Tarif de l'espace", value: "Dès 950 €" },
  { label: "Caution", value: "Pas de caution demandée" },
  { label: "Acompte", value: "30 % du montant total" },
];

const amethysteDetails: RoomExtendedDetails = {
  summary:
    "Espace enfants modulable de 85 m², lumineux et accessible PMR. Idéal pour ateliers, animations et activités jusqu'à 50 enfants.",
  features: [...studioCommonFeatures],
  layoutCapacities: {
    u: 30,
    meeting: 50,
    conference: 50,
    classroom: 50,
    banquet: null,
    cocktail: null,
  },
  pricing: espaceEnfantsPricing,
};

const crysolitheDetails: RoomExtendedDetails = {
  summary:
    "Espace enfants de 85 m² en configuration classe, avec écran mural et tables modulables. Ateliers et formations jusqu'à 50 enfants.",
  images: [
    {
      src: "/rooms/crysolithe/01-salle.png",
      alt: "Salle avec chaises vertes et écran mural",
    },
  ],
  features: [...studioCommonFeatures],
  layoutCapacities: {
    u: 30,
    meeting: 50,
    conference: 50,
    classroom: 50,
    banquet: null,
    cocktail: null,
  },
  pricing: espaceEnfantsPricing,
};

const jaspeDetails: RoomExtendedDetails = {
  summary:
    "Espace enfants de 85 m², lumineux et accessible PMR. Salle modulable pour ateliers, animations et activités jusqu'à 50 enfants.",
  features: [...studioCommonFeatures],
  layoutCapacities: {
    u: 30,
    meeting: 50,
    conference: 50,
    classroom: 50,
    banquet: null,
    cocktail: null,
  },
  pricing: espaceEnfantsPricing,
};

const hyacintheDetails: RoomExtendedDetails = {
  summary:
    "Grand espace enfants de 160 m², lumineux et accessible PMR. Salle modulable pour grands ateliers, animations et événements jusqu'à 100 enfants.",
  features: [...studioCommonFeatures],
  layoutCapacities: {
    u: 50,
    meeting: 100,
    conference: 100,
    classroom: 80,
    banquet: 20,
    cocktail: 100,
  },
  pricing: [
    { label: "Tarif de l'espace", value: "Dès 1 000 €" },
    { label: "Caution", value: "Pas de caution demandée" },
    { label: "Acompte", value: "30 % du montant total" },
  ],
};

const berilDetails: RoomExtendedDetails = {
  summary:
    "Espace enfants de 85 m² en configuration classe, lumineux et accessible PMR. Idéal pour ateliers et activités jusqu'à 40 enfants.",
  features: [...studioCommonFeatures],
  layoutCapacities: {
    u: null,
    meeting: null,
    conference: null,
    classroom: 40,
    banquet: null,
    cocktail: null,
  },
  pricing: espaceEnfantsPricing,
};

const agatheDetails: RoomExtendedDetails = {
  summary:
    "Espace enfants ludique de 120 m² avec piscine à balles, jeux et parcours au sol. Accessible PMR, idéal pour animations jusqu'à 50 enfants.",
  images: [
    {
      src: "/rooms/agathe/01-jeux.png",
      alt: "Espace jeux avec piscine à balles et arc-en-ciel mural",
    },
  ],
  features: [...studioCommonFeatures],
  layoutCapacities: {
    u: null,
    meeting: null,
    conference: null,
    classroom: 50,
    banquet: null,
    cocktail: null,
  },
  pricing: espaceEnfantsPricing,
};

const emissionTvDetails: RoomExtendedDetails = {
  summary:
    "Studio d'émission TV de 110 m², lumineux et équipé pour tournages et plateaux télé. Configuration conférence jusqu'à 50 personnes en public, ou plateau réunion pour 4 intervenants.",
  features: [
    { label: "Événements acceptés", value: "Privés et professionnels" },
    { label: "Scène", value: "Non" },
    { label: "Piste de danse", value: "Non" },
    { label: "Lumière naturelle", value: "Oui" },
    { label: "Climatisation", value: "Oui" },
    { label: "Chauffage", value: "Oui" },
    { label: "Accès handicapé (PMR)", value: "Oui" },
    { label: "Manifestations dansantes", value: "Oui" },
    { label: "Disponibilité de l'espace", value: "Tous les jours" },
  ],
  layoutCapacities: {
    u: null,
    meeting: 4,
    conference: 50,
    classroom: null,
    banquet: null,
    cocktail: null,
  },
  pricing: [
    { label: "Tarif de l'espace", value: "Sur devis" },
    { label: "Caution", value: "Pas de caution demandée" },
    { label: "Acompte", value: "30 % du montant total" },
  ],
};

const ROOM_DETAILS: Record<string, RoomExtendedDetails> = {
  auditorium: auditoriumDetails,
  diamant: diamantDetails,
  sardoine: sardoineDetails,
  saphir: saphirDetails,
  topaze: topazeDetails,
  or: orDetails,
  emeraude: emeraudeDetails,
  escarboucle: escarboucleDetails,
  sardius: sardiusDetails,
  sardonyx: sardonyxDetails,
  "emission-tv": emissionTvDetails,
  "plateau-tv-fond-vert": plateauTvFondVertDetails,
  "debat-tv-table-ronde": debatTvTableRondeDetails,
  "enregistrement-audio": enregistrementAudioDetails,
  amethyste: amethysteDetails,
  crysolithe: crysolitheDetails,
  jaspe: jaspeDetails,
  hyacinthe: hyacintheDetails,
  beril: berilDetails,
  agathe: agatheDetails,
};

export function getRoomExtendedDetails(slug: string): RoomExtendedDetails | null {
  return ROOM_DETAILS[slug] ?? null;
}
