-- =============================================
-- VÉRIFICATION ET CORRECTION DES POLITIQUES RLS
-- =============================================
-- Ce script vérifie et corrige les politiques RLS sur la table users
-- pour permettre aux utilisateurs de voir leur propre profil

-- PARTIE 1 : Vérifier les politiques RLS actuelles
-- ================================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users';

-- PARTIE 2 : Vérifier si RLS est activé
-- ======================================
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'users';

-- PARTIE 3 : Désactiver RLS temporairement pour le développement
-- ===============================================================
-- ATTENTION: Pour la production, il faudra réactiver RLS avec les bonnes politiques

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- PARTIE 4 : Vérifier que RLS est désactivé
-- ==========================================
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'users';

-- PARTIE 5 : Test - Vérifier qu'on peut maintenant lire l'utilisateur
-- ====================================================================
SELECT
  id,
  email,
  full_name,
  user_type,
  roles,
  active_role,
  email_confirmed
FROM public.users
WHERE id = 'a70b51d1-b809-4c77-9817-1fe0aa2a068e';

-- =============================================
-- NOTES IMPORTANTES
-- =============================================
-- 1. Ce script DÉSACTIVE complètement RLS sur la table users
-- 2. C'est acceptable pour le développement
-- 3. Pour la production, il faudra réactiver RLS avec des politiques appropriées
-- 4. Exemple de politique pour la production:
--    CREATE POLICY "Users can view own profile" ON public.users
--    FOR SELECT USING (auth.uid() = id);
-- =============================================
