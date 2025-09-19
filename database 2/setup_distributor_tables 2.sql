-- Configuration des tables pour les fonctionnalités distributeur

-- Table brands pour les marques des distributeurs
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  distributor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  logo_url TEXT,
  banner_url TEXT,
  primary_color TEXT DEFAULT '#2563eb',
  secondary_color TEXT DEFAULT '#1e40af',
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(distributor_id)
);

-- Activer RLS sur la table brands
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table brands
CREATE POLICY "Distributors can view own brand" ON brands
  FOR SELECT USING (auth.uid() = distributor_id);

CREATE POLICY "Distributors can update own brand" ON brands
  FOR UPDATE USING (auth.uid() = distributor_id);

CREATE POLICY "Distributors can insert own brand" ON brands
  FOR INSERT WITH CHECK (auth.uid() = distributor_id);

-- Table quotes pour les devis
CREATE TABLE IF NOT EXISTS quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  distributor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  delivery_request_id UUID REFERENCES delivery_requests(id) ON DELETE SET NULL,
  products JSONB NOT NULL, -- Array of {product_id, quantity, unit_price}
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  status quote_status DEFAULT 'draft',
  payment_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS sur la table quotes
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table quotes
CREATE POLICY "Distributors can view own quotes" ON quotes
  FOR SELECT USING (auth.uid() = distributor_id);

CREATE POLICY "Distributors can create own quotes" ON quotes
  FOR INSERT WITH CHECK (auth.uid() = distributor_id);

CREATE POLICY "Distributors can update own quotes" ON quotes
  FOR UPDATE USING (auth.uid() = distributor_id);

CREATE POLICY "Clients can view quotes for them" ON quotes
  FOR SELECT USING (auth.uid() = client_id);

-- Table delivery_requests pour les demandes de livraison
CREATE TABLE IF NOT EXISTS delivery_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  budget_range JSONB NOT NULL, -- {min: number, max: number}
  pickup_address TEXT,
  pickup_coordinates JSONB, -- {lat: number, lng: number}
  delivery_address TEXT,
  delivery_coordinates JSONB, -- {lat: number, lng: number}
  status delivery_request_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS sur la table delivery_requests
ALTER TABLE delivery_requests ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table delivery_requests
CREATE POLICY "Clients can view own delivery requests" ON delivery_requests
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Clients can create own delivery requests" ON delivery_requests
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update own delivery requests" ON delivery_requests
  FOR UPDATE USING (auth.uid() = client_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_brands_updated_at 
  BEFORE UPDATE ON brands 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at 
  BEFORE UPDATE ON quotes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_requests_updated_at 
  BEFORE UPDATE ON delivery_requests 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Configuration du bucket brand-assets pour Supabase Storage
-- Politique pour permettre la lecture publique des assets de marque
CREATE POLICY "Allow public read access to brand assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'brand-assets');

-- Politique pour permettre aux distributeurs authentifiés d'uploader leurs assets
CREATE POLICY "Allow authenticated uploads to brand assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'brand-assets' 
    AND auth.role() = 'authenticated'
  );

-- Politique pour permettre aux distributeurs de mettre à jour leurs assets
CREATE POLICY "Allow distributors to update own brand assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'brand-assets' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Politique pour permettre aux distributeurs de supprimer leurs assets
CREATE POLICY "Allow distributors to delete own brand assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'brand-assets' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Insérer quelques données de test (optionnel)
-- INSERT INTO brands (distributor_id, name, primary_color, secondary_color) VALUES
--   ('REMPLACER_PAR_VRAI_ID_DISTRIBUTEUR', 'Ma Marque', '#2563eb', '#1e40af')
-- ON CONFLICT (distributor_id) DO NOTHING;








