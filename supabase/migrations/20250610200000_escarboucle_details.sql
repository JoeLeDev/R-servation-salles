-- Fiche détaillée Escarboucle

update public.rooms set
  description = 'Salon de réunion 50 m², lumière naturelle, table de conférence. Jusqu''à 20 personnes.',
  equipment = array[
    'Table de conférence',
    'Prises intégrées',
    'Écran TV',
    'Visioconférence',
    'Climatisation',
    'Chauffage',
    'Lumière naturelle',
    'Accès PMR'
  ],
  floor_label = 'R+1',
  plan_zone = 'salons'
where slug = 'escarboucle';
