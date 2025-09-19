-- Script simple pour créer des produits de test
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier les producteurs existants
SELECT 
  id,
  user_type,
  created_at
FROM users 
WHERE user_type = 'producer'
ORDER BY created_at;

-- 2. Créer des produits pour le premier producteur (le plus ancien)
INSERT INTO products (
  producer_id,
  category_id,
  name,
  description,
  price,
  stock_quantity,
  available_quantity,
  unit_type,
  images
) VALUES 
(
  (SELECT id FROM users WHERE user_type = 'producer' ORDER BY created_at LIMIT 1),
  (SELECT id FROM categories WHERE name_fr = 'Volailles Vivantes' LIMIT 1),
  'Poulets fermiers',
  'Poulets élevés en plein air, nourris aux céréales naturelles',
  4500,
  45,
  45,
  'piece',
  ARRAY['https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg']
),
(
  (SELECT id FROM users WHERE user_type = 'producer' ORDER BY created_at LIMIT 1),
  (SELECT id FROM categories WHERE name_fr = 'Volailles Vivantes' LIMIT 1),
  'Poussins pondeuses',
  'Poussins de race pondeuse, prêts pour l''élevage',
  2800,
  120,
  120,
  'piece',
  ARRAY['https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg']
),
(
  (SELECT id FROM users WHERE user_type = 'producer' ORDER BY created_at LIMIT 1),
  (SELECT id FROM categories WHERE name_fr = 'Œufs & Reproduction' LIMIT 1),
  'Œufs de poule',
  'Œufs frais de poules pondeuses',
  200,
  500,
  500,
  'piece',
  ARRAY['https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg']
),
(
  (SELECT id FROM users WHERE user_type = 'producer' ORDER BY created_at LIMIT 1),
  (SELECT id FROM categories WHERE name_fr = 'Aliments & Nutrition' LIMIT 1),
  'Aliment ponte premium',
  'Aliment de qualité pour poules pondeuses',
  18500,
  30,
  30,
  'sac',
  ARRAY['https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg']
),
(
  (SELECT id FROM users WHERE user_type = 'producer' ORDER BY created_at LIMIT 1),
  (SELECT id FROM categories WHERE name_fr = 'Équipements Élevage' LIMIT 1),
  'Mangeoires automatiques',
  'Mangeoires automatiques pour volailles',
  15500,
  15,
  15,
  'piece',
  ARRAY['https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg']
);

-- 3. Créer des produits pour le deuxième producteur
INSERT INTO products (
  producer_id,
  category_id,
  name,
  description,
  price,
  stock_quantity,
  available_quantity,
  unit_type,
  images
) VALUES 
(
  (SELECT id FROM users WHERE user_type = 'producer' ORDER BY created_at LIMIT 1 OFFSET 1),
  (SELECT id FROM categories WHERE name_fr = 'Volailles Vivantes' LIMIT 1),
  'Poulets de chair',
  'Poulets de chair de qualité supérieure',
  5200,
  60,
  60,
  'piece',
  ARRAY['https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg']
),
(
  (SELECT id FROM users WHERE user_type = 'producer' ORDER BY created_at LIMIT 1 OFFSET 1),
  (SELECT id FROM categories WHERE name_fr = 'Volailles Vivantes' LIMIT 1),
  'Pintades',
  'Pintades locales, viande savoureuse',
  7500,
  30,
  30,
  'piece',
  ARRAY['https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg']
),
(
  (SELECT id FROM users WHERE user_type = 'producer' ORDER BY created_at LIMIT 1 OFFSET 1),
  (SELECT id FROM categories WHERE name_fr = 'Œufs & Reproduction' LIMIT 1),
  'Œufs bio',
  'Œufs biologiques de poules élevées en plein air',
  250,
  300,
  300,
  'piece',
  ARRAY['https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg']
),
(
  (SELECT id FROM users WHERE user_type = 'producer' ORDER BY created_at LIMIT 1 OFFSET 1),
  (SELECT id FROM categories WHERE name_fr = 'Aliments & Nutrition' LIMIT 1),
  'Aliment croissance',
  'Aliment pour volailles en croissance',
  14500,
  35,
  35,
  'sac',
  ARRAY['https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg']
),
(
  (SELECT id FROM users WHERE user_type = 'producer' ORDER BY created_at LIMIT 1 OFFSET 1),
  (SELECT id FROM categories WHERE name_fr = 'Équipements Élevage' LIMIT 1),
  'Abreuvoirs automatiques',
  'Abreuvoirs automatiques pour volailles',
  12500,
  20,
  20,
  'piece',
  ARRAY['https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg']
);

-- 4. Vérifier les produits créés
SELECT 
  p.id,
  p.name,
  p.price,
  p.stock_quantity,
  p.unit_type,
  c.name_fr as category,
  u.id as producer_id
FROM products p
JOIN categories c ON p.category_id = c.id
JOIN users u ON p.producer_id = u.id
WHERE u.user_type = 'producer'
ORDER BY u.created_at, p.name;








