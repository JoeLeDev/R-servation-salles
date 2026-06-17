-- Fiche détaillée Béril

update public.rooms set
  description = 'Espace enfants 85 m², configuration classe. Jusqu''à 40 enfants.',
  pricing_type = 'from',
  base_price = 950,
  equipment = array[
    'Tables enfants',
    'Chaises',
    'Tableaux',
    'Climatisation',
    'Chauffage',
    'Lumière naturelle',
    'Accès PMR'
  ],
  floor_label = 'RDC',
  plan_zone = 'enfants'
where slug = 'beril';
