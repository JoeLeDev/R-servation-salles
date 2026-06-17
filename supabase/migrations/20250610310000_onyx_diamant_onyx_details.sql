-- Fiche détaillée Onyx

update public.rooms set
  description = 'Salle polyvalente 500 m², mur LED, régie lumière/son. Configurations conférence, banquet ou cocktail jusqu''à 500 personnes.',
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
where slug = 'onyx';

-- Fiche détaillée Diamant & Onyx

update public.rooms set
  description = 'Ensemble modulable Diamant & Onyx 1 000 m². Conférences, banquets et cocktails jusqu''à 1 000 personnes.',
  equipment = array[
    'Mur LED',
    'Régie lumière & son',
    'Éclairage professionnel',
    'Sonorisation',
    'Modulable',
    'Climatisation',
    'Chauffage',
    'Accès PMR'
  ],
  floor_label = 'R+1',
  plan_zone = 'polyvalente-ouest'
where slug = 'diamant-onyx';
