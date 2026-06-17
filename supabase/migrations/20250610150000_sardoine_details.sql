-- Fiche détaillée Sardoine

update public.rooms set
  description = 'Salle polyvalente 200 m², lumière naturelle, vidéoprojecteur. Séminaires et formations jusqu''à 200 personnes.',
  equipment = array[
    'Vidéoprojecteur',
    'Climatisation',
    'Chauffage',
    'Lumière naturelle',
    'Accès PMR'
  ],
  floor_label = 'R+1',
  plan_zone = 'polyvalente-est'
where slug = 'sardoine';
