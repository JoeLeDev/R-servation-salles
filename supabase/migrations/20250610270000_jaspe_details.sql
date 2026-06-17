-- Fiche détaillée Jaspe

update public.rooms set
  description = 'Espace enfants modulable 85 m². Ateliers et animations jusqu''à 50 enfants.',
  pricing_type = 'from',
  base_price = 950,
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
where slug = 'jaspe';
