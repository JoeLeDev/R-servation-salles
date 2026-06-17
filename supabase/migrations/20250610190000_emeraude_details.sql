-- Fiche détaillée Emeraude

update public.rooms set
  description = 'Salon lounge 60 m², lumière naturelle, écran TV. Réunions informelles jusqu''à 40 personnes.',
  equipment = array[
    'Écran TV',
    'Visioconférence',
    'Canapés modulables',
    'Climatisation',
    'Chauffage',
    'Lumière naturelle',
    'Accès PMR'
  ],
  floor_label = 'R+1',
  plan_zone = 'salons'
where slug = 'emeraude';
