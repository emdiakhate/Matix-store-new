-- Vérifier les utilisateurs existants dans la table users
SELECT 
  id,
  business_name,
  email,
  user_type
FROM users 
WHERE user_type = 'producer'
ORDER BY created_at DESC
LIMIT 10;

-- Vérifier aussi tous les utilisateurs
SELECT 
  id,
  business_name,
  email,
  user_type
FROM users 
ORDER BY created_at DESC
LIMIT 20;