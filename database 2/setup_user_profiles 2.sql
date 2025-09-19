-- Configuration de la table user_profiles
-- Cette table stocke les informations de profil des utilisateurs

-- Créer la table user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  avatar TEXT,
  city TEXT,
  address TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Activer RLS sur la table user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leur propre profil
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de modifier leur propre profil
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de créer leur propre profil
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Configuration du bucket user-avatars pour Supabase Storage
-- Note: Ces commandes doivent être exécutées dans l'interface Supabase Storage

-- 1. Créer le bucket 'user-avatars' dans Supabase Storage
-- 2. Configurer les politiques RLS pour le bucket

-- Politique pour permettre la lecture publique des avatars
CREATE POLICY "Allow public read access to user avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-avatars');

-- Politique pour permettre aux utilisateurs authentifiés d'uploader leur avatar
CREATE POLICY "Allow authenticated uploads to user avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' 
    AND auth.role() = 'authenticated'
  );

-- Politique pour permettre aux utilisateurs de mettre à jour leur avatar
CREATE POLICY "Allow users to update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Politique pour permettre aux utilisateurs de supprimer leur avatar
CREATE POLICY "Allow users to delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Insérer quelques profils de test (optionnel)
INSERT INTO user_profiles (user_id, name, email, phone, avatar, city, address, bio) VALUES
  ('b9e68c20-60df-40d9-9a35-1df76838bc29', 'Amadou Diallo', 'amadou@example.com', '+221 77 123 4567', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100', 'Dakar', 'Marché Colobane, Dakar', 'Producteur de volailles passionné'),
  ('7a869eeb-fc4a-40b9-af95-820461e592b9', 'Fatou Sall', 'fatou@example.com', '+221 76 234 5678', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100', 'Thiès', 'Zone industrielle, Thiès', 'Distributeur spécialisé en produits avicoles')
ON CONFLICT (user_id) DO NOTHING;








