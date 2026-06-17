-- Fiche détaillée Émission TV

update public.rooms set
  description = 'Studio d''émission TV 110 m², plateau et public jusqu''à 50 personnes.',
  equipment = array[
    'Caméras',
    'Régie vidéo',
    'Éclairage studio',
    'Sonorisation',
    'Prompteur',
    'Climatisation',
    'Chauffage',
    'Lumière naturelle',
    'Accès PMR'
  ],
  floor_label = 'RDC',
  plan_zone = 'studios'
where slug = 'emission-tv';
