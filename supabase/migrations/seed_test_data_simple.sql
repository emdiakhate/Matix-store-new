-- =============================================
-- SEED TEST DATA - VERSION SIMPLIFIÉE
-- =============================================
-- Ce script crée les catégories et produits de test
-- en utilisant les utilisateurs EXISTANTS dans la base

-- PARTIE 1 : Vérifier les utilisateurs existants
-- ===============================================
SELECT
  id,
  email,
  full_name,
  user_type,
  business_name
FROM public.users
ORDER BY created_at DESC
LIMIT 5;

-- PARTIE 2 : Créer les catégories
-- ================================
-- On supprime d'abord les catégories existantes pour éviter les doublons
DELETE FROM public.categories WHERE name IN ('Volaille', 'Œufs', 'Poussins');

-- Insertion des catégories
INSERT INTO public.categories (id, name, description, image_url) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Volaille', 'Poulets, poules, dindes et autres volailles', 'https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('10000000-0000-0000-0000-000000000002', 'Œufs', 'Œufs frais, œufs à couver, œufs bio', 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('10000000-0000-0000-0000-000000000003', 'Poussins', 'Poussins de chair, poussins pondeuses, reproducteurs', 'https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=400')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url;

-- PARTIE 3 : Créer les produits pour l'utilisateur connecté
-- ==========================================================
-- IMPORTANT: Remplacez 'YOUR_USER_ID_HERE' par votre ID utilisateur réel
-- Vous pouvez le trouver en exécutant la PARTIE 1 ci-dessus

-- Pour insérer automatiquement avec le premier utilisateur trouvé, utilisez:
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Récupérer le premier utilisateur de type producer
  SELECT id INTO v_user_id
  FROM public.users
  WHERE user_type = 'producer'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Si aucun producer n'existe, prendre n'importe quel utilisateur
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id
    FROM public.users
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  -- Vérifier qu'on a trouvé un utilisateur
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Aucun utilisateur trouvé dans la base de données';
  END IF;

  -- Afficher l'utilisateur utilisé
  RAISE NOTICE 'Création des produits pour l''utilisateur: %', v_user_id;

  -- Supprimer les produits existants pour cet utilisateur (optionnel)
  -- DELETE FROM public.products WHERE producer_id = v_user_id;

  -- Insérer 20 produits
  INSERT INTO public.products (
    id, producer_id, category_id, name, description,
    price, discount_price, discount_percentage, is_on_sale,
    stock_quantity, available_quantity, unit_type,
    images, breed_race, average_weight_kg, is_vaccinated, is_active
  ) VALUES
  -- CATÉGORIE VOLAILLE (10 produits)
  (
    'a0000000-0000-0000-0000-000000000001',
    v_user_id,
    '10000000-0000-0000-0000-000000000001',
    'Poulets Fermiers Race Locale',
    'Poulets élevés en plein air, nourris aux grains naturels. Race locale sénégalaise robuste et savoureuse. Âge: 4-5 mois.',
    25000, 21250, 15, true,
    50, 50, 'piece',
    ARRAY['https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=800'],
    'Race Locale Sénégalaise', 2.5, true, true
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    v_user_id,
    '10000000-0000-0000-0000-000000000001',
    'Poulets de Chair Cobb 500',
    'Poulets de chair race Cobb 500, croissance rapide. Prêts à 45 jours. Excellente conversion alimentaire.',
    18000, NULL, NULL, false,
    100, 100, 'piece',
    ARRAY['https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=800'],
    'Cobb 500', 2.2, true, true
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    v_user_id,
    '10000000-0000-0000-0000-000000000001',
    'Poules Pondeuses ISA Brown',
    'Poules pondeuses en production, 8 mois. Excellente productivité: 280-300 œufs/an.',
    12000, 9600, 20, true,
    30, 30, 'piece',
    ARRAY['https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=800'],
    'ISA Brown', 1.8, true, true
  ),
  (
    'a0000000-0000-0000-0000-000000000004',
    v_user_id,
    '10000000-0000-0000-0000-000000000001',
    'Poulets Bio Label Rouge',
    'Poulets certifiés bio, élevage plein air intégral. Alimentation 100% bio. Âge minimum 81 jours.',
    32000, NULL, NULL, false,
    20, 20, 'piece',
    ARRAY['https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=800'],
    'Label Rouge', 2.8, true, true
  ),
  (
    'a0000000-0000-0000-0000-000000000005',
    v_user_id,
    '10000000-0000-0000-0000-000000000001',
    'Dindes Bronze d''Amérique',
    'Dindes de race Bronze d''Amérique. Excellent goût. Poids moyen 8-10 kg. Idéal fêtes.',
    45000, 36000, 20, true,
    15, 15, 'piece',
    ARRAY['https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=800'],
    'Bronze d''Amérique', 9.0, true, true
  ),
  (
    'a0000000-0000-0000-0000-000000000006',
    v_user_id,
    '10000000-0000-0000-0000-000000000001',
    'Canards de Barbarie',
    'Canards de Barbarie. Viande maigre et savoureuse. 12 semaines. Poids vif 3-4 kg.',
    15000, NULL, NULL, false,
    25, 25, 'piece',
    ARRAY['https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=800'],
    'Barbarie', 3.5, true, true
  ),
  (
    'a0000000-0000-0000-0000-000000000007',
    v_user_id,
    '10000000-0000-0000-0000-000000000001',
    'Pintades Adultes',
    'Pintades élevées traditionnellement. Viande ferme et goûteuse. 16-20 semaines.',
    8500, 7225, 15, true,
    40, 40, 'piece',
    ARRAY['https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=800'],
    'Pintade Locale', 1.6, true, true
  ),
  (
    'a0000000-0000-0000-0000-000000000008',
    v_user_id,
    '10000000-0000-0000-0000-000000000001',
    'Coqs Reproducteurs',
    'Coqs reproducteurs de qualité. Race Brahma. Excellente fertilité. 10-12 mois.',
    18000, NULL, NULL, false,
    10, 10, 'piece',
    ARRAY['https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=800'],
    'Brahma', 4.5, true, true
  ),
  (
    'a0000000-0000-0000-0000-000000000009',
    v_user_id,
    '10000000-0000-0000-0000-000000000001',
    'Poulets Prêts à Cuire',
    'Poulets éviscérés, prêts à cuire. Fraîchement abattus. Conditionnement sous vide possible.',
    22000, 17600, 20, true,
    35, 35, 'piece',
    ARRAY['https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=800'],
    'Cobb 500', 2.0, true, true
  ),
  (
    'a0000000-0000-0000-0000-000000000010',
    v_user_id,
    '10000000-0000-0000-0000-000000000001',
    'Lot 10 Poules Réforme',
    'Lot de 10 poules pondeuses en fin de ponte. Bonnes pour consommation. 18-24 mois.',
    50000, 40000, 20, true,
    5, 5, 'lot',
    ARRAY['https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=800'],
    'ISA Brown', 1.5, true, true
  ),

  -- CATÉGORIE ŒUFS (5 produits)
  (
    'a0000000-0000-0000-0000-000000000011',
    v_user_id,
    '10000000-0000-0000-0000-000000000002',
    'Œufs Frais de Ferme (30 unités)',
    'Œufs extra-frais pondus du jour. Poules élevées en plein air. Alimentation naturelle.',
    3000, NULL, NULL, false,
    100, 100, 'plateau',
    ARRAY['https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=800'],
    NULL, NULL, NULL, true
  ),
  (
    'a0000000-0000-0000-0000-000000000012',
    v_user_id,
    '10000000-0000-0000-0000-000000000002',
    'Œufs Bio Certifiés (12 unités)',
    'Œufs bio certifiés. Poules nourries 100% bio. Label AB. Conditionnement carton recyclé.',
    2500, 2000, 20, true,
    80, 80, 'boite',
    ARRAY['https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=800'],
    NULL, NULL, NULL, true
  ),
  (
    'a0000000-0000-0000-0000-000000000013',
    v_user_id,
    '10000000-0000-0000-0000-000000000002',
    'Œufs à Couver Poulet Chair',
    'Œufs à couver fertilisés. Race Cobb 500. Taux éclosion >85%. Conservation 7 jours max.',
    250, NULL, NULL, false,
    500, 500, 'piece',
    ARRAY['https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=800'],
    NULL, NULL, NULL, true
  ),
  (
    'a0000000-0000-0000-0000-000000000014',
    v_user_id,
    '10000000-0000-0000-0000-000000000002',
    'Œufs à Couver Pondeuse',
    'Œufs à couver race ISA Brown. Parents sélectionnés. Excellent taux fertilité.',
    300, 255, 15, true,
    400, 400, 'piece',
    ARRAY['https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=800'],
    NULL, NULL, NULL, true
  ),
  (
    'a0000000-0000-0000-0000-000000000015',
    v_user_id,
    '10000000-0000-0000-0000-000000000002',
    'Œufs Caille (100 unités)',
    'Œufs de caille frais. Riches en nutriments. Idéal consommation et reproduction.',
    5000, NULL, NULL, false,
    50, 50, 'plateau',
    ARRAY['https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=800'],
    NULL, NULL, NULL, true
  ),

  -- CATÉGORIE POUSSINS (5 produits)
  (
    'a0000000-0000-0000-0000-000000000016',
    v_user_id,
    '10000000-0000-0000-0000-000000000003',
    'Poussins Chair Cobb 500 (1 jour)',
    'Poussins d''un jour race Cobb 500. Vaccinés Marek. Croissance rapide. Lot minimum 50.',
    750, 637, 15, true,
    1000, 1000, 'piece',
    ARRAY['https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=800'],
    'Cobb 500', 0.045, true, true
  ),
  (
    'a0000000-0000-0000-0000-000000000017',
    v_user_id,
    '10000000-0000-0000-0000-000000000003',
    'Poussins Pondeuses ISA (1 jour)',
    'Poussins pondeuses ISA Brown. Sexage femelle garanti. Vaccination complète.',
    850, NULL, NULL, false,
    800, 800, 'piece',
    ARRAY['https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=800'],
    'ISA Brown', 0.042, true, true
  ),
  (
    'a0000000-0000-0000-0000-000000000018',
    v_user_id,
    '10000000-0000-0000-0000-000000000003',
    'Poussins Race Locale (1 semaine)',
    'Poussins race locale 7 jours. Très rustiques. Résistants maladies. Bien démarrés.',
    1200, 960, 20, true,
    300, 300, 'piece',
    ARRAY['https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=800'],
    'Locale', 0.065, true, true
  ),
  (
    'a0000000-0000-0000-0000-000000000019',
    v_user_id,
    '10000000-0000-0000-0000-000000000003',
    'Poussins Ross 308 (1 jour)',
    'Poussins chair Ross 308. Alternative Cobb. Excellente performance. Vaccinés.',
    780, NULL, NULL, false,
    900, 900, 'piece',
    ARRAY['https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=800'],
    'Ross 308', 0.044, true, true
  ),
  (
    'a0000000-0000-0000-0000-000000000020',
    v_user_id,
    '10000000-0000-0000-0000-000000000003',
    'Canetons Barbarie (1 jour)',
    'Canetons Barbarie jour. Sexage possible. Croissance 12 semaines. Prix par unité.',
    1500, 1200, 20, true,
    200, 200, 'piece',
    ARRAY['https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=800'],
    'Barbarie', 0.050, true, true
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    discount_price = EXCLUDED.discount_price,
    discount_percentage = EXCLUDED.discount_percentage,
    is_on_sale = EXCLUDED.is_on_sale,
    stock_quantity = EXCLUDED.stock_quantity,
    available_quantity = EXCLUDED.available_quantity,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

END $$;

-- PARTIE 4 : Vérification
-- ========================
SELECT
  'Catégories créées' as resultat,
  COUNT(*) as nombre
FROM public.categories;

SELECT
  'Produits créés' as resultat,
  COUNT(*) as nombre
FROM public.products;

-- Afficher quelques produits créés
SELECT
  p.id,
  p.name,
  p.price,
  p.discount_price,
  p.is_on_sale,
  p.stock_quantity,
  c.name as category,
  u.email as producer
FROM public.products p
JOIN public.categories c ON p.category_id = c.id
JOIN public.users u ON p.producer_id = u.id
ORDER BY p.created_at DESC
LIMIT 10;
