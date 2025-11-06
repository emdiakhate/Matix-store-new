-- =============================================
-- VÉRIFICATION DE LA STRUCTURE DES TABLES
-- =============================================

-- PARTIE 1 : Voir la structure de la table categories
-- ====================================================
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'categories'
ORDER BY ordinal_position;

-- PARTIE 2 : Voir la structure de la table products
-- ==================================================
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'products'
ORDER BY ordinal_position;

-- PARTIE 3 : Voir tous les utilisateurs existants
-- ================================================
SELECT
  id,
  email,
  full_name,
  user_type,
  business_name,
  created_at
FROM public.users
ORDER BY created_at DESC;
