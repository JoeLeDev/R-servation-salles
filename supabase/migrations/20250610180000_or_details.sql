-- Fiche détaillée Or

update public.rooms set
  description = 'Salle polyvalente 200 m², lumière naturelle, vidéoprojecteur. Conférence ou réunion jusqu''à 200 personnes.',
  equipment = array[
    'Vidéoprojecteur',
    'Écran de projection',
    'Climatisation',
    'Chauffage',
    'Lumière naturelle',
    'Accès PMR'
  ],
  floor_label = 'R+1',
  plan_zone = 'polyvalente-est'
where slug = 'or';
