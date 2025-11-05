-- ============================================
-- SEED DATA : Créer 2 Utilisateurs de Test + 20 Produits
-- Date: 2025-11-05
-- ============================================

-- IMPORTANT : Exécuter APRÈS fix_authentication.sql

-- ============================================
-- ÉTAPE 1: Créer 2 Utilisateurs de Test
-- ============================================

-- Note: Ces utilisateurs seront créés directement dans la table users
-- Pour qu'ils puissent se connecter, il faudra aussi créer leurs comptes dans auth.users
-- via l'interface Supabase ou via l'inscription normale

-- Utilisateur 1 : Amadou Diallo (Fermier principal)
INSERT INTO public.users (
  id,
  email,
  phone,
  full_name,
  user_type,
  roles,
  active_role,
  business_name,
  farm_name,
  farm_address,
  region,
  is_verified,
  email_confirmed,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'amadou@matix-test.com',
  '+221771234567',
  'Amadou Diallo',
  'producer',
  ARRAY['farmer', 'distributor'],
  'farmer',
  'Ferme Diallo & Fils',
  'Ferme Avicole Diallo',
  'Thiès, Route de Dakar',
  'Thiès',
  true,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- Utilisateur 2 : Fatou Sow (Distributrice principale)
INSERT INTO public.users (
  id,
  email,
  phone,
  full_name,
  user_type,
  roles,
  active_role,
  business_name,
  farm_name,
  farm_address,
  region,
  is_verified,
  email_confirmed,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'fatou@matix-test.com',
  '+221779876543',
  'Fatou Sow',
  'producer',
  ARRAY['farmer', 'distributor'],
  'distributor',
  'Distribution Sow',
  'Élevage Moderne Sow',
  'Dakar, Parcelles Assainies',
  'Dakar',
  true,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- ============================================
-- ÉTAPE 2: Créer les Catégories si elles n'existent pas
-- ============================================

-- Catégorie Volailles
INSERT INTO public.categories (id, name, name_fr, description, description_fr, icon)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  'Poultry',
  'Volailles',
  'Chickens, ducks, turkeys and other poultry',
  'Poulets, canards, dindes et autres volailles',
  '🐔'
) ON CONFLICT (id) DO NOTHING;

-- Catégorie Œufs
INSERT INTO public.categories (id, name, name_fr, description, description_fr, icon)
VALUES (
  '10000000-0000-0000-0000-000000000002',
  'Eggs',
  'Œufs',
  'Fresh eggs from various poultry',
  'Œufs frais de volailles',
  '🥚'
) ON CONFLICT (id) DO NOTHING;

-- Catégorie Poussins
INSERT INTO public.categories (id, name, name_fr, description, description_fr, icon)
VALUES (
  '10000000-0000-0000-0000-000000000003',
  'Chicks',
  'Poussins',
  'Day-old chicks and young birds',
  'Poussins d''un jour et jeunes oiseaux',
  '🐣'
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ÉTAPE 3: Produits pour Amadou Diallo (10 produits)
-- ============================================

-- Produit 1 : Poulets Fermiers Race Locale
INSERT INTO public.products (
  id, producer_id, category_id, name, description, price, stock_quantity, available_quantity,
  unit_type, images, breed_race, average_weight_kg, is_vaccinated, vaccination_details, minimum_order_quantity
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  '10000000-0000-0000-0000-000000000001',
  'Poulets Fermiers Race Locale',
  'Poulets élevés en plein air, nourris aux grains naturels. Race locale sénégalaise robuste et savoureuse. Âge: 4-5 mois.',
  25000,
  50,
  50,
  'piece',
  ARRAY['https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Race Locale Sénégalaise',
  2.5,
  true,
  'Newcastle, Gumboro, vaccins complets',
  5
) ON CONFLICT (id) DO NOTHING;

-- Produit 2 : Poussins Pondeuses ISA Brown
INSERT INTO public.products (
  id, producer_id, category_id, name, description, price, stock_quantity, available_quantity,
  unit_type, images, breed_race, average_weight_kg, is_vaccinated, vaccination_details, minimum_order_quantity
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  '11111111-1111-1111-1111-111111111111',
  '10000000-0000-0000-0000-000000000003',
  'Poussins Pondeuses ISA Brown',
  'Poussins pondeuses de 1 jour, race ISA Brown. Excellente production d''œufs. Garantie de démarrage 95%.',
  2500,
  200,
  200,
  'piece',
  ARRAY['https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'ISA Brown',
  0.05,
  true,
  'Marek, vaccins d''écloserie',
  10
) ON CONFLICT (id) DO NOTHING;

-- Produit 3 : Poulets de Chair Cobb 500
INSERT INTO public.products (
  id, producer_id, category_id, name, description, price, stock_quantity, available_quantity,
  unit_type, images, breed_race, average_weight_kg, is_vaccinated, vaccination_details, minimum_order_quantity
) VALUES (
  'a0000000-0000-0000-0000-000000000003',
  '11111111-1111-1111-1111-111111111111',
  '10000000-0000-0000-0000-000000000001',
  'Poulets de Chair Cobb 500',
  'Poulets de chair prêts pour la vente. Race Cobb 500, croissance rapide. Âge: 6 semaines, poids moyen 2kg.',
  15000,
  100,
  100,
  'piece',
  ARRAY['https://images.pexels.com/photos/1247498/pexels-photo-1247498.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Cobb 500',
  2.0,
  true,
  'Programme complet Newcastle, Gumboro, Bronchite',
  10
) ON CONFLICT (id) DO NOTHING;

-- Produit 4 : Œufs Frais Fermiers (Plateau 30)
INSERT INTO public.products (
  id, producer_id, category_id, name, description, price, stock_quantity, available_quantity,
  unit_type, images, specific_type, minimum_order_quantity
) VALUES (
  'a0000000-0000-0000-0000-000000000004',
  '11111111-1111-1111-1111-111111111111',
  '10000000-0000-0000-0000-000000000002',
  'Œufs Frais Fermiers (Plateau 30)',
  'Œufs extra-frais de poules élevées en plein air. Plateau de 30 œufs. Ramassés quotidiennement.',
  4500,
  80,
  80,
  'tray',
  ARRAY['https://images.pexels.com/photos/1556707/pexels-photo-1556707.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Œufs bruns calibre L',
  0.9,
  false,
  NULL,
  3
) ON CONFLICT (id) DO NOTHING;

-- Produit 5 : Dindes Fermières
INSERT INTO public.products (
  id, producer_id, category_id, name, description, price, stock_quantity, available_quantity,
  unit_type, images, breed_race, average_weight_kg, is_vaccinated, minimum_order_quantity
) VALUES (
  'a0000000-0000-0000-0000-000000000005',
  '11111111-1111-1111-1111-111111111111',
  '10000000-0000-0000-0000-000000000001',
  'Dindes Fermières',
  'Dindes fermières de qualité supérieure. Idéales pour occasions spéciales. Âge: 5-6 mois.',
  45000,
  20,
  20,
  'piece',
  ARRAY['https://images.pexels.com/photos/1557843/pexels-photo-1557843.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Bronze d''Amérique',
  8.0,
  true,
  'Vaccins complets',
  2
) ON CONFLICT (id) DO NOTHING;

-- Produit 6 : Canards de Barbarie
INSERT INTO public.products (
  id, producer_id, category_id, name, description, price, stock_quantity, available_quantity,
  unit_type, images, breed_race, average_weight_kg, is_vaccinated, minimum_order_quantity
) VALUES (
  'a0000000-0000-0000-0000-000000000006',
  '11111111-1111-1111-1111-111111111111',
  '10000000-0000-0000-0000-000000000001',
  'Canards de Barbarie',
  'Canards de Barbarie adultes. Excellente chair, faciles à élever. Parfaits pour restaurants.',
  12000,
  40,
  40,
  'piece',
  ARRAY['https://images.pexels.com/photos/1661535/pexels-photo-1661535.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Barbarie',
  3.5,
  true,
  'Vaccins de base',
  5
) ON CONFLICT (id) DO NOTHING;

-- Produit 7 : Poules Pondeuses Réformées
INSERT INTO public.products (
  id, producer_id, category_id, name, description, price, stock_quantity, available_quantity,
  unit_type, images, breed_race, average_weight_kg, minimum_order_quantity
) VALUES (
  'a0000000-0000-0000-0000-000000000007',
  '11111111-1111-1111-1111-111111111111',
  '10000000-0000-0000-0000-000000000001',
  'Poules Pondeuses Réformées',
  'Poules pondeuses en fin de cycle (18 mois). Idéales pour bouillon ou chair. Bon état général.',
  8000,
  150,
  150,
  'piece',
  ARRAY['https://images.pexels.com/photos/1660028/pexels-photo-1660028.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'ISA Brown',
  1.8,
  true,
  'Vaccins complets durant le cycle',
  10
) ON CONFLICT (id) DO NOTHING;

-- Produit 8 : Coqs Reproducteurs
INSERT INTO public.products (
  id, producer_id, category_id, name, description, price, stock_quantity, available_quantity,
  unit_type, images, breed_race, average_weight_kg, is_vaccinated, minimum_order_quantity
) VALUES (
  'a0000000-0000-0000-0000-000000000008',
  '11111111-1111-1111-1111-111111111111',
  '10000000-0000-0000-0000-000000000001',
  'Coqs Reproducteurs Race Locale',
  'Coqs reproducteurs sélectionnés pour leurs qualités génétiques. Race locale pure.',
  35000,
  15,
  15,
  'piece',
  ARRAY['https://images.pexels.com/photos/1300355/pexels-photo-1300355.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Race Locale Sénégalaise',
  3.5,
  true,
  'Vaccins complets',
  1
) ON CONFLICT (id) DO NOTHING;

-- Produit 9 : Poussins de Chair (1 jour)
INSERT INTO public.products (
  id, producer_id, category_id, name, description, price, stock_quantity, available_quantity,
  unit_type, images, breed_race, is_vaccinated, minimum_order_quantity
) VALUES (
  'a0000000-0000-0000-0000-000000000009',
  '11111111-1111-1111-1111-111111111111',
  '10000000-0000-0000-0000-000000000003',
  'Poussins de Chair Ross 308 (1 jour)',
  'Poussins de chair d''un jour, souche Ross 308. Croissance rapide et efficacité alimentaire optimale.',
  1800,
  500,
  500,
  'piece',
  ARRAY['https://images.pexels.com/photos/1267684/pexels-photo-1267684.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Ross 308',
  0.04,
  true,
  'Vaccins d''écloserie (Marek)',
  50
) ON CONFLICT (id) DO NOTHING;

-- Produit 10 : Pintades Fermières
INSERT INTO public.products (
  id, producer_id, category_id, name, description, price, stock_quantity, available_quantity,
  unit_type, images, breed_race, average_weight_kg, is_vaccinated, minimum_order_quantity
) VALUES (
  'a0000000-0000-0000-0000-000000000010',
  '11111111-1111-1111-1111-111111111111',
  '10000000-0000-0000-0000-000000000001',
  'Pintades Fermières',
  'Pintades élevées en semi-liberté. Goût authentique, chair ferme. Âge: 4 mois.',
  18000,
  30,
  30,
  'piece',
  ARRAY['https://images.pexels.com/photos/1661176/pexels-photo-1661176.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Pintade locale',
  1.5,
  true,
  'Vaccins de base',
  5
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ÉTAPE 4: Produits pour Fatou Sow (10 produits)
-- ============================================

-- Produit 11 : Poulets Prêts à Cuire
INSERT INTO public.products (
  id, producer_id, category_id, name, description, price, stock_quantity, available_quantity,
  unit_type, images, breed_race, average_weight_kg, minimum_order_quantity
) VALUES (
  'b0000000-0000-0000-0000-000000000001',
  '22222222-2222-2222-2222-222222222222',
  '10000000-0000-0000-0000-000000000001',
  'Poulets Prêts à Cuire',
  'Poulets fermiers abattus et prêts à cuisiner. Fraîcheur garantie. Livrés le jour même.',
  28000,
  60,
  60,
  'piece',
  ARRAY['https://images.pexels.com/photos/60153/chicken-rooster-poultry-hen-60153.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Hybride commercial',
  2.2,
  true,
  'Vaccins complets',
  3
) ON CONFLICT (id) DO NOTHING;

-- Produit 12 : Œufs Bio (Boîte de 12)
INSERT INTO public.products (
  id, producer_id, category_id, name, description, price, stock_quantity, available_quantity,
  unit_type, images, specific_type, minimum_order_quantity
) VALUES (
  'b0000000-0000-0000-0000-000000000002',
  '22222222-2222-2222-2222-222222222222',
  '10000000-0000-0000-0000-000000000002',
  'Œufs Bio (Boîte de 12)',
  'Œufs biologiques certifiés. Poules nourries sans OGM, en plein air. Qualité premium.',
  3000,
  100,
  100,
  'box',
  ARRAY['https://images.pexels.com/photos/1556706/pexels-photo-1556706.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Œufs Bio calibre M',
  0.4,
  false,
  NULL,
  5
) ON CONFLICT (id) DO NOTHING;

-- Produit 13 : Poulets Label Rouge
INSERT INTO public.products (
  id, producer_id, category_id, name, description, price, stock_quantity, available_quantity,
  unit_type, images, breed_race, average_weight_kg, is_vaccinated, minimum_order_quantity
) VALUES (
  'b0000000-0000-0000-0000-000000000003',
  '22222222-2222-2222-2222-222222222222',
  '10000000-0000-0000-0000-000000000001',
  'Poulets Label Rouge',
  'Poulets certifiés Label Rouge. Élevage en plein air, alimentation 100% végétale. Qualité supérieure.',
  32000,
  40,
  40,
  'piece',
  ARRAY['https://images.pexels.com/photos/1653355/pexels-photo-1653355.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Label Rouge',
  2.8,
  true,
  'Programme sanitaire complet',
  2
) ON CONFLICT (id) DO NOTHING;

-- Produit 14 : Cailles Fermières (Lot de 10)
INSERT INTO public.products (
  id, producer_id, category_id, name, description, price, stock_quantity, available_quantity,
  unit_type, images, breed_race, average_weight_kg, minimum_order_quantity
) VALUES (
  'b0000000-0000-0000-0000-000000000004',
  '22222222-2222-2222-2222-222222222222',
  '10000000-0000-0000-0000-000000000001',
  'Cailles Fermières (Lot de 10)',
  'Cailles d''élevage, idéales pour consommation ou reproduction. Vendues par lot de 10.',
  6000,
  25,
  25,
  'lot',
  ARRAY['https://images.pexels.com/photos/1661177/pexels-photo-1661177.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Caille japonaise',
  0.25,
  false,
  NULL,
  1
) ON CONFLICT (id) DO NOTHING;

-- Produit 15 : Œufs de Caille (Plateau 60)
INSERT INTO public.products (
  id, producer_id, category_id, name, description, price, stock_quantity, available_quantity,
  unit_type, images, specific_type, minimum_order_quantity
) VALUES (
  'b0000000-0000-0000-0000-000000000005',
  '22222222-2222-2222-2222-222222222222',
  '10000000-0000-0000-0000-000000000002',
  'Œufs de Caille (Plateau 60)',
  'Œufs de caille frais. Riches en protéines, goût délicat. Plateau de 60 œufs.',
  3500,
  50,
  50,
  'tray',
  ARRAY['https://images.pexels.com/photos/3688/food-healthy-eggs-protein.jpg?auto=compress&cs=tinysrgb&w=800'],
  'Œufs de caille',
  0.15,
  false,
  NULL,
  2
) ON CONFLICT (id) DO NOTHING;

-- Produit 16 : Poussins Pondeuses Lohmann Brown
INSERT INTO public.products (
  id, producer_id, category_id, name, description, price, stock_quantity, available_quantity,
  unit_type, images, breed_race, is_vaccinated, minimum_order_quantity
) VALUES (
  'b0000000-0000-0000-0000-000000000006',
  '22222222-2222-2222-2222-222222222222',
  '10000000-0000-0000-0000-000000000003',
  'Poussins Pondeuses Lohmann Brown',
  'Poussins pondeuses souche Lohmann Brown. Production élevée, résistance aux maladies. Garantie 97%.',
  2800,
  300,
  300,
  'piece',
  ARRAY['https://images.pexels.com/photos/1267684/pexels-photo-1267684.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Lohmann Brown',
  0.05,
  true,
  'Marek + vaccins d''écloserie',
  20
) ON CONFLICT (id) DO NOTHING;

-- Produit 17 : Coquelets Grillés (Prêts)
INSERT INTO public.products (
  id, producer_id, category_id, name, description, price, stock_quantity, available_quantity,
  unit_type, images, breed_race, average_weight_kg, minimum_order_quantity
) VALUES (
  'b0000000-0000-0000-0000-000000000007',
  '22222222-2222-2222-2222-222222222222',
  '10000000-0000-0000-0000-000000000001',
  'Coquelets pour Grillades',
  'Coquelets jeunes (6 semaines), parfaits pour grillades. Chair tendre et savoureuse.',
  10000,
  80,
  80,
  'piece',
  ARRAY['https://images.pexels.com/photos/1556915/pexels-photo-1556915.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Hybride commercial',
  1.2,
  true,
  'Vaccins complets',
  5
) ON CONFLICT (id) DO NOTHING;

-- Produit 18 : Poules Sussex
INSERT INTO public.products (
  id, producer_id, category_id, name, description, price, stock_quantity, available_quantity,
  unit_type, images, breed_race, average_weight_kg, is_vaccinated, minimum_order_quantity
) VALUES (
  'b0000000-0000-0000-0000-000000000008',
  '22222222-2222-2222-2222-222222222222',
  '10000000-0000-0000-0000-000000000001',
  'Poules Sussex',
  'Poules Sussex adultes, excellentes pondeuses. Race rustique, double usage (œufs et chair).',
  22000,
  30,
  30,
  'piece',
  ARRAY['https://images.pexels.com/photos/1660027/pexels-photo-1660027.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Sussex',
  2.5,
  true,
  'Programme complet',
  3
) ON CONFLICT (id) DO NOTHING;

-- Produit 19 : Œufs Extra-Frais (Plateau 15)
INSERT INTO public.products (
  id, producer_id, category_id, name, description, price, stock_quantity, available_quantity,
  unit_type, images, specific_type, minimum_order_quantity
) VALUES (
  'b0000000-0000-0000-0000-000000000009',
  '22222222-2222-2222-2222-222222222222',
  '10000000-0000-0000-0000-000000000002',
  'Œufs Extra-Frais (Plateau 15)',
  'Œufs extra-frais pondus dans les dernières 24h. Calibre XL. Qualité restaurant.',
  2800,
  60,
  60,
  'tray',
  ARRAY['https://images.pexels.com/photos/1556707/pexels-photo-1556707.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Œufs blancs XL',
  0.5,
  false,
  NULL,
  3
) ON CONFLICT (id) DO NOTHING;

-- Produit 20 : Canards Mulards
INSERT INTO public.products (
  id, producer_id, category_id, name, description, price, stock_quantity, available_quantity,
  unit_type, images, breed_race, average_weight_kg, is_vaccinated, minimum_order_quantity
) VALUES (
  'b0000000-0000-0000-0000-000000000010',
  '22222222-2222-2222-2222-222222222222',
  '10000000-0000-0000-0000-000000000001',
  'Canards Mulards',
  'Canards mulards pour production de foie gras ou magret. Qualité supérieure.',
  16000,
  35,
  35,
  'piece',
  ARRAY['https://images.pexels.com/photos/1661535/pexels-photo-1661535.jpeg?auto=compress&cs=tinysrgb&w=800'],
  'Mulard',
  4.0,
  true,
  'Vaccins de base',
  5
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Compter les utilisateurs créés
SELECT 'Utilisateurs créés:' as info, COUNT(*) as total FROM public.users WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);

-- Compter les produits par utilisateur
SELECT
  u.full_name,
  COUNT(p.id) as nombre_produits,
  SUM(p.stock_quantity) as stock_total
FROM public.users u
LEFT JOIN public.products p ON p.producer_id = u.id
WHERE u.id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
)
GROUP BY u.id, u.full_name;

-- Lister tous les produits
SELECT
  p.name,
  u.full_name as producteur,
  p.price,
  p.stock_quantity,
  c.name_fr as categorie
FROM public.products p
JOIN public.users u ON p.producer_id = u.id
LEFT JOIN public.categories c ON p.category_id = c.id
WHERE p.producer_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
)
ORDER BY u.full_name, p.name;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================

-- 1. Ces utilisateurs sont créés UNIQUEMENT dans la table users
-- 2. Pour qu'ils puissent se connecter, il faut aussi créer leurs comptes dans auth.users
-- 3. Vous pouvez le faire via:
--    - L'interface d'inscription normale (recommandé)
--    - Ou via Supabase Dashboard → Authentication → Add User
--
-- Credentials suggérés pour les tests:
-- Utilisateur 1: amadou@matix-test.com / Password123!
-- Utilisateur 2: fatou@matix-test.com / Password123!
--
-- 4. Toutes les images utilisent Pexels (gratuites et libres de droits)
-- 5. Les prix sont en FCFA (1 EUR ≈ 656 FCFA)
-- 6. Chaque utilisateur a 10 produits variés dans différentes catégories
