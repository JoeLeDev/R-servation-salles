-- Fiche détaillée Sardius

update public.rooms set
  description = 'Salon de réunion 40 m², lumière naturelle, table de conférence. Jusqu''à 30 personnes.',
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
where slug = 'sardius';
