-- Vérifier les utilisateurs producteurs
SELECT 
  id,
  user_type,
  business_name,
  is_verified,
  created_at
FROM users 
WHERE user_type = 'producer';

-- Vérifier les produits
SELECT 
  p.id,
  p.name,
  p.user_id,
  p.category_id,
  p.price,
  p.stock_quantity,
  u.business_name,
  c.name_fr as category_name
FROM products p
JOIN users u ON p.user_id = u.id
LEFT JOIN categories c ON p.category_id = c.id
LIMIT 10;

-- Vérifier les catégories
SELECT * FROM categories;

-- Compter les producteurs
SELECT 
  user_type,
  COUNT(*) as count,
  COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_count
FROM users 
GROUP BY user_type;







