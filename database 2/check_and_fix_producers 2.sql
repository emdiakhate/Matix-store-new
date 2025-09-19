-- 1. Vérifier les producteurs actuels
SELECT 
  id,
  user_type,
  business_name,
  is_verified,
  created_at
FROM users 
WHERE user_type = 'producer';

-- 2. Vérifier les produits
SELECT 
  p.id,
  p.name,
  p.user_id,
  p.category_id,
  p.price,
  p.stock_quantity,
  u.business_name,
  u.user_type
FROM products p
JOIN users u ON p.user_id = u.id
LIMIT 20;

-- 3. Compter les produits par utilisateur
SELECT 
  u.id,
  u.business_name,
  u.user_type,
  COUNT(p.id) as product_count
FROM users u
LEFT JOIN products p ON u.id = p.user_id
WHERE u.user_type = 'producer'
GROUP BY u.id, u.business_name, u.user_type;

-- 4. Vérifier les catégories
SELECT * FROM categories LIMIT 10;

-- 5. Si les produits n'existent pas, les recréer
-- (Ceci est un exemple, à adapter selon vos besoins)
-- INSERT INTO products (id, name, description, price, stock_quantity, unit_type, user_id, category_id, images)
-- VALUES 
--   (gen_random_uuid(), 'Poulets de chair', 'Poulets de chair de qualité', 5000, 100, 'piece', 'b9e68c20-60df-40d9-9a35-1df76838bc29', '1', '[]'),
--   (gen_random_uuid(), 'Œufs frais', 'Œufs frais du jour', 150, 500, 'piece', 'b9e68c20-60df-40d9-9a35-1df76838bc29', '2', '[]');







