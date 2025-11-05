-- ============================================
-- AUTO-FIX : Créer automatiquement TOUS les utilisateurs manquants
-- Exécutez ce SQL pour corriger le problème immédiatement
-- ============================================

-- PARTIE 1 : Créer les utilisateurs manquants automatiquement
-- ============================================

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
  TRIM(CONCAT(
    COALESCE(au.raw_user_meta_data->>'prenom', ''),
    ' ',
    COALESCE(au.raw_user_meta_data->>'nom', '')
  )),
  'producer',
  ARRAY['farmer', 'distributor'],
  'farmer',
  au.email_confirmed_at IS NOT NULL,
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.users u ON u.id = au.id
WHERE u.id IS NULL; -- Seulement les utilisateurs qui n'ont pas d'entrée dans public.users

-- PARTIE 2 : Vérification
-- ============================================

-- Compter les utilisateurs
SELECT
  (SELECT COUNT(*) FROM auth.users) as total_auth,
  (SELECT COUNT(*) FROM public.users) as total_public,
  (SELECT COUNT(*) FROM auth.users) - (SELECT COUNT(*) FROM public.users) as difference;

-- La différence devrait être 0 maintenant !

-- PARTIE 3 : Voir tous les utilisateurs créés
-- ============================================

SELECT
  u.id,
  u.email,
  u.full_name,
  u.phone,
  u.roles,
  u.active_role,
  u.email_confirmed,
  u.created_at
FROM public.users u
ORDER BY u.created_at DESC;

-- PARTIE 4 : Vérifier le trigger pour les futurs utilisateurs
-- ============================================

SELECT
  'Trigger existe: ' || CASE WHEN COUNT(*) > 0 THEN 'OUI ✅' ELSE 'NON ❌' END as status
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Si le statut est "NON ❌", ré-exécutez fix_authentication.sql

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================

-- Après avoir exécuté ce SQL :
-- 1. Tous les utilisateurs de auth.users ont maintenant une entrée dans public.users
-- 2. Chaque utilisateur a roles = ['farmer', 'distributor']
-- 3. Chaque utilisateur a active_role = 'farmer' par défaut
-- 4. Vous pouvez maintenant vous connecter sans erreur 406

-- PROCHAINES ÉTAPES :
-- 1. Rechargez http://localhost:3001
-- 2. Connectez-vous avec votre compte
-- 3. Vous devriez voir votre dashboard ✅
-- 4. Testez la création d'un NOUVEAU compte pour vérifier que le trigger fonctionne
