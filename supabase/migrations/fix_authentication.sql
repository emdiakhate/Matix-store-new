-- ============================================
-- MIGRATION : Correction de l'Authentification
-- Date: 2025-11-05
-- ============================================

-- ÉTAPE 1: Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_user_signup();

-- ÉTAPE 2: Supprimer la table profiles (doublon avec users)
-- ATTENTION: Cela va supprimer toutes les données de profiles
-- Si vous avez des données importantes, sauvegardez-les d'abord
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ÉTAPE 3: Vérifier la structure de la table users
-- La table users doit avoir cette structure (elle existe déjà)
-- Si des colonnes manquent, les ajouter :

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT ARRAY['farmer'::text],
ADD COLUMN IF NOT EXISTS active_role TEXT DEFAULT 'farmer'::text CHECK (active_role = ANY (ARRAY['farmer'::text, 'distributor'::text]));

-- Mettre à jour user_type si NULL
UPDATE public.users SET user_type = 'producer' WHERE user_type IS NULL;

-- ÉTAPE 4: Créer la fonction pour gérer les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insérer le nouvel utilisateur dans la table users
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
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'telephone', NEW.raw_user_meta_data->>'phone', ''),
    CONCAT(
      COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
      ' ',
      COALESCE(NEW.raw_user_meta_data->>'nom', '')
    ),
    'producer', -- Type par défaut
    ARRAY['farmer', 'distributor'], -- Chaque utilisateur a les 2 rôles
    'farmer', -- Rôle actif par défaut
    NEW.email_confirmed_at IS NOT NULL,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    full_name = EXCLUDED.full_name,
    email_confirmed = EXCLUDED.email_confirmed,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log l'erreur mais ne bloque pas la création du compte
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- ÉTAPE 5: Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ÉTAPE 6: Ajouter des commentaires
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically create user record when auth.users is created';
COMMENT ON COLUMN public.users.roles IS 'Array of roles: farmer and/or distributor';
COMMENT ON COLUMN public.users.active_role IS 'Currently active role for dashboard switching';

-- ÉTAPE 7: Vérifier que le trigger est créé
SELECT
  tgname as trigger_name,
  tgtype as trigger_type,
  proname as function_name
FROM pg_trigger
JOIN pg_proc ON pg_trigger.tgfoid = pg_proc.oid
WHERE tgname = 'on_auth_user_created';

-- ÉTAPE 8: Test du trigger (optionnel - à exécuter manuellement)
-- Pour tester, créez un compte via l'interface et vérifiez :
-- SELECT * FROM public.users ORDER BY created_at DESC LIMIT 1;

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Quand un utilisateur s'inscrit via Supabase Auth:
-- 1. Un enregistrement est créé dans auth.users
-- 2. Le trigger s'exécute automatiquement
-- 3. Un enregistrement est créé dans public.users avec:
--    - roles = ['farmer', 'distributor'] (les 2 rôles)
--    - active_role = 'farmer' (rôle par défaut)
--    - user_type = 'producer'
-- 4. L'utilisateur peut ensuite switcher entre farmer et distributor
