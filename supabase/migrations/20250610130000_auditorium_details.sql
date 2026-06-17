-- Fiche détaillée Auditorium (description + équipements enrichis)

update public.rooms set
  description = 'Grand auditorium modulable sur plusieurs niveaux, scène professionnelle 400 m², mur LED géant, régie lumière/son. Événements privés et professionnels. Accès PMR.',
  equipment = array[
    'Mur LED géant',
    'Régie lumière & son',
    'Line array',
    'Scène 400 m²',
    'Gradins multi-niveaux',
    'Climatisation',
    'Chauffage',
    'Accès PMR',
    'Manifestations dansantes'
  ],
  requires_second_approval = true,
  floor_label = 'R+1',
  plan_zone = 'auditorium'
where slug = 'auditorium';
