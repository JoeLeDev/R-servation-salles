-- Fiche détaillée Crysolithe

update public.rooms set
  description = 'Espace enfants 85 m², configuration classe. Ateliers et formations jusqu''à 50 enfants.',
  pricing_type = 'from',
  base_price = 950,
  equipment = array[
    'Écran mural',
    'Tableaux blancs',
    'Tables modulables',
    'Chaises',
    'Climatisation',
    'Chauffage',
    'Lumière naturelle',
    'Accès PMR'
  ],
  floor_label = 'RDC',
  plan_zone = 'enfants'
where slug = 'crysolithe';
