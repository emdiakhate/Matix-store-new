-- =============================================
-- SEED TEST DATA - ADAPTÉ AUX VRAIES COLONNES
-- =============================================
-- Ce script crée les catégories et produits de test
-- en utilisant SEULEMENT les colonnes qui existent

-- PARTIE 1 : Créer les catégories (avec les vraies colonnes)
-- ===========================================================
DELETE FROM public.categories WHERE name IN ('Volaille', 'Œufs', 'Poussins');

INSERT INTO public.categories (id, name, name_fr, description, description_fr, icon) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Poultry', 'Volaille', 'Chickens, hens, turkeys and other poultry', 'Poulets, poules, dindes et autres volailles', '🐔'),
  ('10000000-0000-0000-0000-000000000002', 'Eggs', 'Œufs', 'Fresh eggs, hatching eggs, organic eggs', 'Œufs frais, œufs à couver, œufs bio', '🥚'),
  ('10000000-0000-0000-0000-000000000003', 'Chicks', 'Poussins', 'Broiler chicks, layer chicks, breeders', 'Poussins de chair, poussins pondeuses, reproducteurs', '🐣')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_fr = EXCLUDED.name_fr,
  description = EXCLUDED.description,
  description_fr = EXCLUDED.description_fr,
  icon = EXCLUDED.icon;

-- PARTIE 2 : Créer les produits pour les deux utilisateurs
-- ==========================================================

-- Utilisateur 1: iantrepreneur221@gmail.com (10 produits)
-- Utilisateur 2: diakhatemalick00@gmail.com (10 produits)

-- PRODUITS UTILISATEUR 1 (iantrepreneur)
INSERT INTO public.products (
  id, producer_id, category_id, name, description, price,
  stock_quantity, available_quantity, unit_type, images,
  breed_race, average_weight_kg, is_vaccinated, age_weeks
) VALUES
-- Volaille (5 produits)
(
  'a0000000-0000-0000-0000-000000000001',
  '105567aa-2548-464b-b914-20dd29829b96',
  '10000000-0000-0000-0000-000000000001',
  'Poulets Fermiers Race Locale',
  'Poulets élevés en plein air, nourris aux grains naturels. Race locale sénégalaise robuste et savoureuse. Âge: 4-5 mois.',
  25000,
  50, 50, 'piece',
  ARRAY['https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Race Locale Sénégalaise', 2.5, true, 20
),
(
  'a0000000-0000-0000-0000-000000000002',
  '105567aa-2548-464b-b914-20dd29829b96',
  '10000000-0000-0000-0000-000000000001',
  'Poulets de Chair Cobb 500',
  'Poulets de chair race Cobb 500, croissance rapide. Prêts à 45 jours. Excellente conversion alimentaire.',
  18000,
  100, 100, 'piece',
  ARRAY['https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Cobb 500', 2.2, true, 6
),
(
  'a0000000-0000-0000-0000-000000000003',
  '105567aa-2548-464b-b914-20dd29829b96',
  '10000000-0000-0000-0000-000000000001',
  'Poules Pondeuses ISA Brown',
  'Poules pondeuses en production, 8 mois. Excellente productivité: 280-300 œufs/an.',
  12000,
  30, 30, 'piece',
  ARRAY['https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'ISA Brown', 1.8, true, 32
),
(
  'a0000000-0000-0000-0000-000000000004',
  '105567aa-2548-464b-b914-20dd29829b96',
  '10000000-0000-0000-0000-000000000001',
  'Dindes Bronze d''Amérique',
  'Dindes de race Bronze d''Amérique. Excellent goût. Poids moyen 8-10 kg. Idéal fêtes.',
  45000,
  15, 15, 'piece',
  ARRAY['https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Bronze d''Amérique', 9.0, true, 24
),
(
  'a0000000-0000-0000-0000-000000000005',
  '105567aa-2548-464b-b914-20dd29829b96',
  '10000000-0000-0000-0000-000000000001',
  'Canards de Barbarie',
  'Canards de Barbarie. Viande maigre et savoureuse. 12 semaines. Poids vif 3-4 kg.',
  15000,
  25, 25, 'piece',
  ARRAY['https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Barbarie', 3.5, true, 12
),
-- Œufs (3 produits)
(
  'a0000000-0000-0000-0000-000000000006',
  '105567aa-2548-464b-b914-20dd29829b96',
  '10000000-0000-0000-0000-000000000002',
  'Œufs Frais de Ferme (30 unités)',
  'Œufs extra-frais pondus du jour. Poules élevées en plein air. Alimentation naturelle.',
  3000,
  100, 100, 'lot',
  ARRAY['https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=800'],
  NULL, NULL, NULL, NULL
),
(
  'a0000000-0000-0000-0000-000000000007',
  '105567aa-2548-464b-b914-20dd29829b96',
  '10000000-0000-0000-0000-000000000002',
  'Œufs à Couver Poulet Chair',
  'Œufs à couver fertilisés. Race Cobb 500. Taux éclosion >85%. Conservation 7 jours max.',
  250,
  500, 500, 'piece',
  ARRAY['https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=800'],
  NULL, NULL, NULL, NULL
),
(
  'a0000000-0000-0000-0000-000000000008',
  '105567aa-2548-464b-b914-20dd29829b96',
  '10000000-0000-0000-0000-000000000002',
  'Œufs Bio Certifiés (12 unités)',
  'Œufs bio certifiés. Poules nourries 100% bio. Label AB. Conditionnement carton recyclé.',
  2500,
  80, 80, 'piece',
  ARRAY['https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=800'],
  NULL, NULL, NULL, NULL
),
-- Poussins (2 produits)
(
  'a0000000-0000-0000-0000-000000000009',
  '105567aa-2548-464b-b914-20dd29829b96',
  '10000000-0000-0000-0000-000000000003',
  'Poussins Chair Cobb 500 (1 jour)',
  'Poussins d''un jour race Cobb 500. Vaccinés Marek. Croissance rapide. Lot minimum 50.',
  750,
  1000, 1000, 'piece',
  ARRAY['https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Cobb 500', 0.045, true, 0
),
(
  'a0000000-0000-0000-0000-000000000010',
  '105567aa-2548-464b-b914-20dd29829b96',
  '10000000-0000-0000-0000-000000000003',
  'Poussins Pondeuses ISA (1 jour)',
  'Poussins pondeuses ISA Brown. Sexage femelle garanti. Vaccination complète.',
  850,
  800, 800, 'piece',
  ARRAY['https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'ISA Brown', 0.042, true, 0
);

-- PRODUITS UTILISATEUR 2 (diakhatemalick)
INSERT INTO public.products (
  id, producer_id, category_id, name, description, price,
  stock_quantity, available_quantity, unit_type, images,
  breed_race, average_weight_kg, is_vaccinated, age_weeks
) VALUES
-- Volaille (5 produits)
(
  'b0000000-0000-0000-0000-000000000001',
  'a70b51d1-b809-4c77-9817-1fe0aa2a068e',
  '10000000-0000-0000-0000-000000000001',
  'Poulets Bio Label Rouge',
  'Poulets certifiés bio, élevage plein air intégral. Alimentation 100% bio. Âge minimum 81 jours.',
  32000,
  20, 20, 'piece',
  ARRAY['https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Label Rouge', 2.8, true, 12
),
(
  'b0000000-0000-0000-0000-000000000002',
  'a70b51d1-b809-4c77-9817-1fe0aa2a068e',
  '10000000-0000-0000-0000-000000000001',
  'Pintades Adultes',
  'Pintades élevées traditionnellement. Viande ferme et goûteuse. 16-20 semaines.',
  8500,
  40, 40, 'piece',
  ARRAY['https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Pintade Locale', 1.6, true, 18
),
(
  'b0000000-0000-0000-0000-000000000003',
  'a70b51d1-b809-4c77-9817-1fe0aa2a068e',
  '10000000-0000-0000-0000-000000000001',
  'Coqs Reproducteurs Brahma',
  'Coqs reproducteurs de qualité. Race Brahma. Excellente fertilité. 10-12 mois.',
  18000,
  10, 10, 'piece',
  ARRAY['https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Brahma', 4.5, true, 48
),
(
  'b0000000-0000-0000-0000-000000000004',
  'a70b51d1-b809-4c77-9817-1fe0aa2a068e',
  '10000000-0000-0000-0000-000000000001',
  'Poulets Prêts à Cuire',
  'Poulets éviscérés, prêts à cuire. Fraîchement abattus. Conditionnement sous vide possible.',
  22000,
  35, 35, 'piece',
  ARRAY['https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Cobb 500', 2.0, true, 6
),
(
  'b0000000-0000-0000-0000-000000000005',
  'a70b51d1-b809-4c77-9817-1fe0aa2a068e',
  '10000000-0000-0000-0000-000000000001',
  'Lot 10 Poules Réforme',
  'Lot de 10 poules pondeuses en fin de ponte. Bonnes pour consommation. 18-24 mois.',
  50000,
  5, 5, 'lot',
  ARRAY['https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'ISA Brown', 1.5, true, 96
),
-- Œufs (3 produits)
(
  'b0000000-0000-0000-0000-000000000006',
  'a70b51d1-b809-4c77-9817-1fe0aa2a068e',
  '10000000-0000-0000-0000-000000000002',
  'Œufs à Couver Pondeuse ISA',
  'Œufs à couver race ISA Brown. Parents sélectionnés. Excellent taux fertilité.',
  300,
  400, 400, 'piece',
  ARRAY['https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=800'],
  NULL, NULL, NULL, NULL
),
(
  'b0000000-0000-0000-0000-000000000007',
  'a70b51d1-b809-4c77-9817-1fe0aa2a068e',
  '10000000-0000-0000-0000-000000000002',
  'Œufs Caille (100 unités)',
  'Œufs de caille frais. Riches en nutriments. Idéal consommation et reproduction.',
  5000,
  50, 50, 'lot',
  ARRAY['https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=800'],
  NULL, NULL, NULL, NULL
),
(
  'b0000000-0000-0000-0000-000000000008',
  'a70b51d1-b809-4c77-9817-1fe0aa2a068e',
  '10000000-0000-0000-0000-000000000002',
  'Œufs Frais Fermiers (60 unités)',
  'Plateau de 60 œufs extra-frais. Production quotidienne. Poules nourries au maïs.',
  5500,
  60, 60, 'lot',
  ARRAY['https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=800'],
  NULL, NULL, NULL, NULL
),
-- Poussins (2 produits)
(
  'b0000000-0000-0000-0000-000000000009',
  'a70b51d1-b809-4c77-9817-1fe0aa2a068e',
  '10000000-0000-0000-0000-000000000003',
  'Poussins Race Locale (1 semaine)',
  'Poussins race locale 7 jours. Très rustiques. Résistants maladies. Bien démarrés.',
  1200,
  300, 300, 'piece',
  ARRAY['https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Locale', 0.065, true, 1
),
(
  'b0000000-0000-0000-0000-000000000010',
  'a70b51d1-b809-4c77-9817-1fe0aa2a068e',
  '10000000-0000-0000-0000-000000000003',
  'Canetons Barbarie (1 jour)',
  'Canetons Barbarie jour. Sexage possible. Croissance 12 semaines. Prix par unité.',
  1500,
  200, 200, 'piece',
  ARRAY['https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Barbarie', 0.050, true, 0
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  available_quantity = EXCLUDED.available_quantity,
  images = EXCLUDED.images;

-- PARTIE 3 : Vérification
-- ========================
SELECT 'Catégories créées' as resultat, COUNT(*) as nombre
FROM public.categories;

SELECT 'Produits créés' as resultat, COUNT(*) as nombre
FROM public.products;

-- Afficher les produits créés
SELECT
  p.id,
  p.name,
  p.price,
  p.stock_quantity,
  c.name_fr as category,
  u.email as producer
FROM public.products p
JOIN public.categories c ON p.category_id = c.id
JOIN public.users u ON p.producer_id = u.id
ORDER BY p.created_at DESC
LIMIT 20;
