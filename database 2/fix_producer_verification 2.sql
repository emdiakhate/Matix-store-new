-- Marquer tous les producteurs comme vérifiés
UPDATE users 
SET is_verified = true 
WHERE user_type = 'producer';

-- Vérifier le résultat
SELECT 
  id,
  user_type,
  business_name,
  is_verified,
  created_at
FROM users 
WHERE user_type = 'producer';

-- Vérifier aussi les produits
SELECT 
  p.id,
  p.name,
  p.user_id,
  p.category_id,
  p.price,
  p.stock_quantity,
  u.business_name,
  u.is_verified,
  c.name_fr as category_name
FROM products p
JOIN users u ON p.user_id = u.id
LEFT JOIN categories c ON p.category_id = c.id
LIMIT 10;







