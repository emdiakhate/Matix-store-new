-- ============================================
-- FIX URGENT : Créer l'entrée manquante dans users
-- ============================================

-- ÉTAPE 1 : Vérifier que le trigger existe
SELECT
  tgname as trigger_name,
  tgenabled as enabled,
  proname as function_name
FROM pg_trigger
JOIN pg_proc ON pg_trigger.tgfoid = pg_proc.oid
WHERE tgname = 'on_auth_user_created';

-- Si le résultat est vide, le trigger n'existe pas !
-- Dans ce cas, ré-exécutez fix_authentication.sql

-- ============================================
-- ÉTAPE 2 : Créer manuellement l'entrée pour l'utilisateur existant
-- ============================================

-- D'abord, récupérer les infos de auth.users
SELECT
  id,
  email,
  raw_user_meta_data->>'prenom' as prenom,
  raw_user_meta_data->>'nom' as nom,
  raw_user_meta_data->>'telephone' as telephone,
  raw_user_meta_data->>'phone' as phone,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE id = 'a70b51d1-b809-4c77-9817-1fe0aa2a068e';

-- Ensuite, créer l'entrée dans users
-- REMPLACEZ les valeurs ci-dessous par celles retournées ci-dessus

INSERT INTO public.users (
  id,
  email,
  phone,
  full_name,
  user_type,
  roles,
  active_role,
  email_confirmed,
  created_at,
  updated_at
) VALUES (
  'a70b51d1-b809-4c77-9817-1fe0aa2a068e', -- ID de auth.users
  'REMPLACER_PAR_EMAIL', -- email de auth.users
  'REMPLACER_PAR_TELEPHONE', -- raw_user_meta_data->>'telephone'
  'REMPLACER_PAR_PRENOM_NOM', -- Concaténer prenom + nom
  'producer', -- Type par défaut
  ARRAY['farmer', 'distributor'], -- Les 2 rôles
  'farmer', -- Rôle actif par défaut
  true, -- Email confirmé (puisqu'il a cliqué sur le lien)
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- ============================================
-- ÉTAPE 3 : Vérifier que l'entrée est créée
-- ============================================

SELECT
  id,
  email,
  full_name,
  roles,
  active_role,
  user_type
FROM public.users
WHERE id = 'a70b51d1-b809-4c77-9817-1fe0aa2a068e';

-- Vous devriez voir votre utilisateur avec roles = ['farmer', 'distributor']

-- ============================================
-- ÉTAPE 4 : Tester le trigger avec un NOUVEAU compte
-- ============================================

-- Après avoir exécuté ce SQL :
-- 1. Allez sur http://localhost:3001
-- 2. Créez un NOUVEAU compte avec un autre email
-- 3. Vérifiez que l'utilisateur apparaît dans public.users automatiquement

-- Pour vérifier :
SELECT
  u.id,
  u.email,
  u.full_name,
  u.roles,
  u.active_role,
  au.created_at as auth_created,
  u.created_at as users_created
FROM public.users u
RIGHT JOIN auth.users au ON u.id = au.id
ORDER BY au.created_at DESC
LIMIT 5;

-- Si users_created est NULL pour les nouveaux utilisateurs,
-- le trigger ne fonctionne toujours pas !

-- ============================================
-- OPTION B : Créer automatiquement pour TOUS les utilisateurs existants
-- ============================================

-- Si vous avez plusieurs utilisateurs sans entrée dans public.users,
-- exécutez ceci :

INSERT INTO public.users (
  id,
  email,
  phone,
  full_name,
  user_type,
  roles,
  active_role,
  email_confirmed,
  created_at,
  updated_at
)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'telephone', au.raw_user_meta_data->>'phone', ''),
  CONCAT(
    COALESCE(au.raw_user_meta_data->>'prenom', ''),
    ' ',
    COALESCE(au.raw_user_meta_data->>'nom', '')
  ),
  'producer',
  ARRAY['farmer', 'distributor'],
  'farmer',
  au.email_confirmed_at IS NOT NULL,
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.users u ON u.id = au.id
WHERE u.id IS NULL; -- Seulement ceux qui n'ont pas d'entrée

-- Vérification finale
SELECT COUNT(*) as total_auth_users FROM auth.users;
SELECT COUNT(*) as total_public_users FROM public.users;
-- Les deux nombres devraient être identiques !

-- ============================================
-- RÉSOLUTION DU PROBLÈME
-- ============================================

-- Après avoir exécuté ce SQL :
-- 1. Rechargez la page http://localhost:3001
-- 2. Connectez-vous avec votre compte
-- 3. L'erreur 406 devrait disparaître ✅
-- 4. Vous devriez voir votre dashboard

-- Si l'erreur persiste, envoyez-moi :
-- 1. Le résultat de l'ÉTAPE 1 (trigger existe ?)
-- 2. Le résultat de l'ÉTAPE 3 (utilisateur dans users ?)
-- 3. Les logs du serveur Next.js
