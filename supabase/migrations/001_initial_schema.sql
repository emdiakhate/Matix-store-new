-- Migration initiale pour l'authentification Matix Store
-- Création du schéma de base avec Row Level Security

-- Créer l'enum pour les rôles utilisateur
CREATE TYPE user_role AS ENUM ('eleveur', 'acheteur', 'admin');

-- Table des profils utilisateur
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    telephone TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'acheteur',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer Row Level Security sur la table profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy : Les utilisateurs peuvent lire leur propre profil
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
CREATE POLICY "Users can read their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Policy : Les utilisateurs peuvent mettre à jour leur propre profil
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policy : Les utilisateurs peuvent insérer leur propre profil
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy : Les profils publics sont visibles par tous (nom, prenom, role uniquement)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at sur profiles
DROP TRIGGER IF EXISTS handle_updated_at_profiles ON public.profiles;
CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Fonction pour créer automatiquement un profil après inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, nom, prenom, telephone, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nom', ''),
        COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
        COALESCE(NEW.raw_user_meta_data->>'telephone', ''),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'acheteur')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil après inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Fonction pour nettoyer le profil lors de la suppression d'un utilisateur
CREATE OR REPLACE FUNCTION public.handle_user_deleted()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.profiles WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour nettoyer le profil lors de la suppression d'un utilisateur
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
    AFTER DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_deleted();

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_telephone_idx ON public.profiles(telephone);

-- Commentaires pour la documentation
COMMENT ON TABLE public.profiles IS 'Profils utilisateur avec informations personnelles et rôle';
COMMENT ON COLUMN public.profiles.id IS 'ID utilisateur (référence auth.users)';
COMMENT ON COLUMN public.profiles.email IS 'Email de l''utilisateur';
COMMENT ON COLUMN public.profiles.nom IS 'Nom de famille';
COMMENT ON COLUMN public.profiles.prenom IS 'Prénom';
COMMENT ON COLUMN public.profiles.telephone IS 'Numéro de téléphone sénégalais';
COMMENT ON COLUMN public.profiles.role IS 'Rôle utilisateur (eleveur, acheteur, admin)';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL de l''avatar utilisateur';
COMMENT ON COLUMN public.profiles.created_at IS 'Date de création du profil';
COMMENT ON COLUMN public.profiles.updated_at IS 'Date de dernière mise à jour';
