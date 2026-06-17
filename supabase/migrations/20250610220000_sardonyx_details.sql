-- Fiche détaillée Sardonyx

update public.rooms set
  description = 'Petit salon de réunion 30 m², climatisé. Jusqu''à 12 personnes.',
  equipment = array[
    'Table de réunion',
    'Écran TV',
    'Visioconférence',
    'Climatisation',
    'Chauffage',
    'Accès PMR'
  ],
  floor_label = 'R+1',
  plan_zone = 'salons'
where slug = 'sardonyx';
