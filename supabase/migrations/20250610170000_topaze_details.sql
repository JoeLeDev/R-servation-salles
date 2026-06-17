-- Fiche détaillée Topaze

update public.rooms set
  description = 'Salle polyvalente 400 m², lumière naturelle, éclairage modulable. Banquet, conférence ou cocktail jusqu''à 400 personnes.',
  equipment = array[
    'Vidéoprojecteur',
    'Éclairage d''ambiance',
    'Sonorisation',
    'Climatisation',
    'Chauffage',
    'Lumière naturelle',
    'Accès PMR'
  ],
  floor_label = 'R+1',
  plan_zone = 'polyvalente-est'
where slug = 'topaze';
