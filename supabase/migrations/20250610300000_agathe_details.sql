-- Fiche détaillée Agathe

update public.rooms set
  description = 'Espace enfants ludique 120 m², piscine à balles et jeux. Jusqu''à 50 enfants.',
  pricing_type = 'from',
  base_price = 950,
  equipment = array[
    'Piscine à balles',
    'Jeux',
    'Panier de basket',
    'Parcours au sol',
    'Climatisation',
    'Chauffage',
    'Lumière naturelle',
    'Accès PMR'
  ],
  floor_label = 'RDC',
  plan_zone = 'enfants'
where slug = 'agathe';
