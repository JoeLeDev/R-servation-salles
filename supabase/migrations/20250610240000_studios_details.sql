-- Fiches détaillées studios production

update public.rooms set
  description = 'Studio TV avec fond vert 50 m². Jusqu''à 10 personnes.',
  equipment = array[
    'Fond vert',
    'Caméras',
    'Régie vidéo',
    'Éclairage studio',
    'Sonorisation',
    'Climatisation',
    'Chauffage',
    'Lumière naturelle',
    'Accès PMR'
  ],
  floor_label = 'RDC',
  plan_zone = 'studios'
where slug = 'plateau-tv-fond-vert';

update public.rooms set
  description = 'Studio débat TV avec table ronde 30 m². Jusqu''à 7 personnes.',
  equipment = array[
    'Table ronde',
    'Caméras',
    'Régie vidéo',
    'Éclairage studio',
    'Sonorisation',
    'Climatisation',
    'Chauffage',
    'Lumière naturelle',
    'Accès PMR'
  ],
  floor_label = 'RDC',
  plan_zone = 'studios'
where slug = 'debat-tv-table-ronde';

update public.rooms set
  description = 'Studio d''enregistrement audio 40 m². Jusqu''à 10 personnes.',
  equipment = array[
    'Insonorisation',
    'Microphones',
    'Régie son',
    'Table de mixage',
    'Climatisation',
    'Chauffage',
    'Lumière naturelle',
    'Accès PMR'
  ],
  floor_label = 'RDC',
  plan_zone = 'studios'
where slug = 'enregistrement-audio';
