-- Fiche détaillée Diamant

update public.rooms set
  description = 'Salle polyvalente modulable 500 m², mur LED, régie lumière/son. Configurations conférence, banquet ou cocktail jusqu''à 500 personnes.',
  equipment = array[
    'Mur LED',
    'Régie lumière & son',
    'Éclairage professionnel',
    'Sonorisation',
    'Climatisation',
    'Chauffage',
    'Accès PMR'
  ],
  floor_label = 'R+1',
  plan_zone = 'polyvalente-ouest'
where slug = 'diamant';
