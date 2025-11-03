-- Migration 003 : Utiliser la table 'users' existante pour l'authentification
-- Date : 2025-01-30
-- Objectif : Remplacer le système 'profiles' par 'users' avec multi-rôles

-- ========================================
-- ÉTAPE 1 : Ajouter les colonnes nécessaires à 'users'
-- ========================================

-- Ajouter colonnes si elles n'existent pas déjà
DO $$ 
BEGIN
    -- Email
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE public.users ADD COLUMN email TEXT;
    END IF;

    -- Full name
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'full_name'
    ) THEN
        ALTER TABLE public.users ADD COLUMN full_name TEXT;
    END IF;

    -- Phone
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.users ADD COLUMN phone TEXT;
    END IF;

    -- Roles (array de rôles disponibles)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'roles'
    ) THEN
        ALTER TABLE public.users ADD COLUMN roles TEXT[] DEFAULT ARRAY['farmer'::text, 'distributor'::text];
    END IF;

    -- Active role (rôle actuellement actif)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'active_role'
    ) THEN
        ALTER TABLE public.users ADD COLUMN active_role TEXT DEFAULT 'farmer'::text;
    END IF;

    -- Avatar URL
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.users ADD COLUMN avatar_url TEXT;
    END IF;

    -- Email confirmed
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'email_confirmed'
    ) THEN
        ALTER TABLE public.users ADD COLUMN email_confirmed BOOLEAN DEFAULT false;
    END IF;
END $$;

-- ========================================
-- ÉTAPE 2 : Créer la fonction trigger pour auto-créer un user après signup
-- ========================================

-- Fonction pour créer automatiquement un user dans la table 'users' après inscription
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        full_name,
        phone,
        roles,
        active_role,
        user_type,
        subscription_status,
        email_confirmed,
        is_verified,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            CONCAT(
                COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
                ' ',
                COALESCE(NEW.raw_user_meta_data->>'nom', '')
            ),
            NEW.email
        ),
        COALESCE(NEW.raw_user_meta_data->>'telephone', NULL),
        ARRAY['farmer'::text, 'distributor'::text],  -- Les 2 rôles par défaut
        'farmer'::text,                              -- Rôle actif par défaut (producteur)
        'producer'::user_type,                       -- Type par défaut (producteur)
        'inactive'::subscription_status,
        NEW.email_confirmed_at IS NOT NULL,          -- Email confirmé si confirmation_at existe
        false,                                       -- Non vérifié par défaut
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, users.full_name),
        phone = COALESCE(EXCLUDED.phone, users.phone),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- ÉTAPE 3 : Remplacer le trigger existant
-- ========================================

-- Supprimer l'ancien trigger qui créait dans 'profiles'
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le nouveau trigger pour créer dans 'users'
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_signup();

-- ========================================
-- ÉTAPE 4 : Créer des index pour optimiser les requêtes
-- ========================================

CREATE INDEX IF NOT EXISTS idx_users_active_role ON public.users(active_role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_roles ON public.users USING GIN(roles);

-- ========================================
-- ÉTAPE 5 : Mettre à jour les politiques RLS si nécessaire
-- ========================================

-- Vérifier si RLS est activé
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'users' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Politique : Les utilisateurs peuvent lire leur propre profil
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Politique : Les utilisateurs peuvent mettre à jour leur propre profil
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Politique : Les utilisateurs peuvent insérer leur propre profil (via trigger, mais au cas où)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Politique : Lecture publique des profils (nom, email uniquement - optionnel)
-- Commenté car peut ne pas être nécessaire selon les besoins
-- DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
-- CREATE POLICY "Public profiles are viewable by everyone" ON public.users
--     FOR SELECT USING (true);

-- ========================================
-- ÉTAPE 6 : Fonction pour changer de rôle
-- ========================================

-- Fonction helper pour changer le rôle actif (sera appelée depuis l'application)
CREATE OR REPLACE FUNCTION public.switch_user_role(
    user_id UUID,
    new_role TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    user_roles TEXT[];
BEGIN
    -- Vérifier que le rôle existe dans les rôles de l'utilisateur
    SELECT roles INTO user_roles
    FROM public.users
    WHERE id = user_id;
    
    -- Vérifier que le nouveau rôle est dans la liste des rôles disponibles
    IF NOT (new_role = ANY(user_roles)) THEN
        RAISE EXCEPTION 'Le rôle % n''est pas disponible pour cet utilisateur', new_role;
    END IF;
    
    -- Mettre à jour le rôle actif
    UPDATE public.users
    SET active_role = new_role,
        updated_at = NOW()
    WHERE id = user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- ÉTAPE 7 : Commentaires pour la documentation
-- ========================================

COMMENT ON TABLE public.users IS 'Table principale des utilisateurs avec système multi-rôles';
COMMENT ON COLUMN public.users.roles IS 'Rôles disponibles : farmer (producteur), distributor (distributeur)';
COMMENT ON COLUMN public.users.active_role IS 'Rôle actuellement actif (farmer ou distributor)';
COMMENT ON COLUMN public.users.email IS 'Email de l''utilisateur (synchronisé depuis auth.users)';
COMMENT ON COLUMN public.users.full_name IS 'Nom complet de l''utilisateur';
COMMENT ON COLUMN public.users.phone IS 'Numéro de téléphone de l''utilisateur';

-- ========================================
-- MESSAGE DE CONFIRMATION
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 003 terminée avec succès !';
    RAISE NOTICE '📊 Table ''users'' configurée avec système multi-rôles';
    RAISE NOTICE '🔄 Trigger créé : auto-création user après signup';
    RAISE NOTICE '🔒 RLS activé et politiques créées';
    RAISE NOTICE '⚡ Index créés pour optimiser les requêtes';
    RAISE NOTICE '🔄 Fonction switch_user_role() créée';
END $$;

