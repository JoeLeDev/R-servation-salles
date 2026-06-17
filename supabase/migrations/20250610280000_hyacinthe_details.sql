-- Fiche détaillée Hyacinthe

update public.rooms set
  description = 'Grand espace enfants 160 m². Ateliers et animations jusqu''à 100 enfants.',
  pricing_type = 'from',
  base_price = 1000,
  equipment = array[
    'Jeux',
    'Tables enfants',
    'Mobilier modulable',
    'Climatisation',
    'Chauffage',
    'Lumière naturelle',
    'Accès PMR'
  ],
  floor_label = 'RDC',
  plan_zone = 'enfants'
where slug = 'hyacinthe';
