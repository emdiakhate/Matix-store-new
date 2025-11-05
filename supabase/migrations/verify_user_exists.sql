-- =============================================
-- VÉRIFICATION COMPLÈTE DE L'UTILISATEUR
-- =============================================
-- Ce script vérifie en détail l'existence de l'utilisateur
-- ID: a70b51d1-b809-4c77-9817-1fe0aa2a068e

-- PARTIE 1 : Vérifier dans auth.users
-- ====================================
SELECT
  'auth.users' as table_name,
  id,
  email,
  created_at,
  email_confirmed_at,
  raw_user_meta_data
FROM auth.users
WHERE id = 'a70b51d1-b809-4c77-9817-1fe0aa2a068e';

-- PARTIE 2 : Vérifier dans public.users
-- ======================================
SELECT
  'public.users' as table_name,
  id,
  email,
  full_name,
  user_type,
  roles,
  active_role,
  email_confirmed,
  created_at
FROM public.users
WHERE id = 'a70b51d1-b809-4c77-9817-1fe0aa2a068e';

-- PARTIE 3 : Compter les occurrences
-- ===================================
SELECT
  (SELECT COUNT(*) FROM auth.users WHERE id = 'a70b51d1-b809-4c77-9817-1fe0aa2a068e') as in_auth_users,
  (SELECT COUNT(*) FROM public.users WHERE id = 'a70b51d1-b809-4c77-9817-1fe0aa2a068e') as in_public_users;

-- PARTIE 4 : Vérifier TOUS les utilisateurs dans public.users
-- ============================================================
SELECT
  id,
  email,
  full_name,
  roles,
  active_role,
  email_confirmed,
  created_at
FROM public.users
ORDER BY created_at DESC;

-- PARTIE 5 : Vérifier les colonnes de la table users
-- ===================================================
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;
