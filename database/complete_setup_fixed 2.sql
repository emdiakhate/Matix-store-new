-- Script complet pour réinitialiser et configurer la base de données MATIX (Version Corrigée)
-- ATTENTION : Ce script supprime toutes les données existantes !

-- ========================================
-- ÉTAPE 1 : NETTOYAGE COMPLET
-- ========================================

-- Supprimer les tables existantes (dans l'ordre pour éviter les erreurs de dépendances)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS brand_products CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS delivery_requests CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Supprimer les types d'énumération existants
DROP TYPE IF EXISTS user_type CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS subscription_type CASCADE;
DROP TYPE IF EXISTS unit_type CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS quote_status CASCADE;
DROP TYPE IF EXISTS delivery_request_status CASCADE;

-- Supprimer les fonctions existantes
DROP FUNCTION IF EXISTS calculate_distance CASCADE;
DROP FUNCTION IF EXISTS search_products_nearby CASCADE;
DROP FUNCTION IF EXISTS get_requests_in_zone CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- ========================================
-- ÉTAPE 2 : CONFIGURATION INITIALE
-- ========================================

-- Extension PostGIS pour la géolocalisation
CREATE EXTENSION IF NOT EXISTS postgis;

-- ========================================
-- ÉTAPE 3 : TYPES D'ÉNUMÉRATION
-- ========================================

CREATE TYPE user_type AS ENUM ('producer', 'distributor', 'client');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'expired');
CREATE TYPE subscription_type AS ENUM ('producer_monthly', 'distributor_monthly');
CREATE TYPE unit_type AS ENUM ('piece', 'kg', 'lot', 'liter');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('orange_money', 'wave', 'free_money', 'bictorys', 'cash');
CREATE TYPE quote_status AS ENUM ('draft', 'sent', 'accepted', 'rejected');
CREATE TYPE delivery_request_status AS ENUM ('pending', 'quoted', 'accepted', 'in_progress', 'completed');

-- ========================================
-- ÉTAPE 4 : TABLES PRINCIPALES
-- ========================================

-- Table des utilisateurs
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    user_type user_type NOT NULL,
    subscription_status subscription_status DEFAULT 'inactive',
    business_name TEXT,
    business_license TEXT,
    coordinates POINT,
    radius_km INTEGER DEFAULT 50,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des catégories
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    name_fr TEXT,
    name_wo TEXT,
    description TEXT,
    description_fr TEXT,
    description_wo TEXT,
    icon TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des produits
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    producer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    title_fr TEXT,
    title_wo TEXT,
    description TEXT NOT NULL,
    description_fr TEXT,
    description_wo TEXT,
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    discount_percentage INTEGER DEFAULT 0,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    unit_type unit_type NOT NULL,
    harvest_date DATE,
    expiry_date DATE,
    is_organic BOOLEAN DEFAULT FALSE,
    is_local_breed BOOLEAN DEFAULT FALSE,
    age_weeks INTEGER,
    vaccination_status TEXT,
    distributor_price DECIMAL(10,2),
    retail_price DECIMAL(10,2),
    location_coordinates POINT,
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des demandes de livraison
CREATE TABLE delivery_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    product_description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    budget_range JSONB NOT NULL, -- {min: number, max: number}
    pickup_address TEXT,
    pickup_coordinates POINT,
    delivery_address TEXT,
    delivery_coordinates POINT,
    status delivery_request_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des devis
CREATE TABLE quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    distributor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    delivery_request_id UUID REFERENCES delivery_requests(id) ON DELETE CASCADE NOT NULL,
    products JSONB NOT NULL, -- [{product_id: string, quantity: number, unit_price: number}]
    subtotal DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    status quote_status DEFAULT 'draft',
    payment_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des commandes
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    seller_type user_type NOT NULL CHECK (seller_type IN ('producer', 'distributor')),
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    payment_method payment_method,
    is_direct_sale BOOLEAN DEFAULT FALSE,
    commission_rate DECIMAL(5,2),
    commission_amount DECIMAL(10,2),
    delivery_coordinates POINT,
    delivery_distance_km DECIMAL(8,2),
    quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des marques
CREATE TABLE brands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    distributor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des produits de marque
CREATE TABLE brand_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    custom_price DECIMAL(10,2),
    custom_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(brand_id, product_id)
);

-- Table des abonnements
CREATE TABLE subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    subscription_type subscription_type NOT NULL,
    status subscription_status DEFAULT 'inactive',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    amount DECIMAL(10,2) NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des paiements
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method payment_method NOT NULL,
    status payment_status DEFAULT 'pending',
    transaction_id TEXT,
    payment_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ÉTAPE 5 : INDEX POUR LES PERFORMANCES
-- ========================================

CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_coordinates ON users USING GIST(coordinates);
CREATE INDEX idx_products_producer_id ON products(producer_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_location ON products USING GIST(location_coordinates);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_delivery_requests_client_id ON delivery_requests(client_id);
CREATE INDEX idx_delivery_requests_status ON delivery_requests(status);
CREATE INDEX idx_quotes_distributor_id ON quotes(distributor_id);
CREATE INDEX idx_quotes_client_id ON quotes(client_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ========================================
-- ÉTAPE 6 : FONCTIONS UTILITAIRES (CORRIGÉES)
-- ========================================

-- Fonction pour calculer la distance entre deux points (version simplifiée)
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DOUBLE PRECISION,
    lng1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lng2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
BEGIN
    -- Formule de Haversine pour calculer la distance entre deux points
    RETURN (
        6371 * acos(
            cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lng2) - radians(lng1)) +
            sin(radians(lat1)) * sin(radians(lat2))
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Fonction pour extraire la latitude d'un point
CREATE OR REPLACE FUNCTION get_lat(point_coord POINT) RETURNS DOUBLE PRECISION AS $$
BEGIN
    RETURN point_coord[0];
END;
$$ LANGUAGE plpgsql;

-- Fonction pour extraire la longitude d'un point
CREATE OR REPLACE FUNCTION get_lng(point_coord POINT) RETURNS DOUBLE PRECISION AS $$
BEGIN
    RETURN point_coord[1];
END;
$$ LANGUAGE plpgsql;

-- Fonction pour rechercher des produits à proximité (version corrigée)
CREATE OR REPLACE FUNCTION search_products_nearby(
    search_lat DOUBLE PRECISION,
    search_lng DOUBLE PRECISION,
    search_radius DOUBLE PRECISION DEFAULT 50
) RETURNS TABLE (
    id UUID,
    producer_id UUID,
    title TEXT,
    description TEXT,
    price DECIMAL(10,2),
    distance_km DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.producer_id,
        p.title,
        p.description,
        p.price,
        calculate_distance(search_lat, search_lng, get_lat(p.location_coordinates), get_lng(p.location_coordinates)) as distance_km
    FROM products p
    WHERE p.location_coordinates IS NOT NULL
    AND calculate_distance(search_lat, search_lng, get_lat(p.location_coordinates), get_lng(p.location_coordinates)) <= search_radius
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les demandes dans une zone (version corrigée)
CREATE OR REPLACE FUNCTION get_requests_in_zone(
    search_lat DOUBLE PRECISION,
    search_lng DOUBLE PRECISION,
    search_radius DOUBLE PRECISION DEFAULT 50
) RETURNS TABLE (
    id UUID,
    client_id UUID,
    product_description TEXT,
    quantity INTEGER,
    distance_km DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dr.id,
        dr.client_id,
        dr.product_description,
        dr.quantity,
        calculate_distance(search_lat, search_lng, get_lat(dr.delivery_coordinates), get_lng(dr.delivery_coordinates)) as distance_km
    FROM delivery_requests dr
    WHERE dr.delivery_coordinates IS NOT NULL
    AND dr.status = 'pending'
    AND calculate_distance(search_lat, search_lng, get_lat(dr.delivery_coordinates), get_lng(dr.delivery_coordinates)) <= search_radius
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- ÉTAPE 7 : TRIGGERS
-- ========================================

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_requests_updated_at BEFORE UPDATE ON delivery_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ÉTAPE 8 : DONNÉES DE BASE
-- ========================================

-- Données de base pour les catégories
INSERT INTO categories (name, name_fr, name_wo, description) VALUES
('Poultry', 'Volaille', 'Ginaar', 'Produits de volaille'),
('Eggs', 'Œufs', 'Nee', 'Œufs frais'),
('Feed', 'Aliments', 'Lekk', 'Aliments pour volaille'),
('Equipment', 'Équipements', 'Jëfandikukay', 'Équipements d''élevage');

-- Sous-catégories
INSERT INTO categories (name, name_fr, name_wo, description, parent_id) 
SELECT 'Live Chickens', 'Poulets vivants', 'Ginaar gëj', 'Poulets vivants pour élevage', id FROM categories WHERE name = 'Poultry';

INSERT INTO categories (name, name_fr, name_wo, description, parent_id) 
SELECT 'Processed Meat', 'Viande transformée', 'Yàpp gëj', 'Viande de volaille transformée', id FROM categories WHERE name = 'Poultry';

INSERT INTO categories (name, name_fr, name_wo, description, parent_id) 
SELECT 'Fresh Eggs', 'Œufs frais', 'Nee gëj', 'Œufs frais de poule', id FROM categories WHERE name = 'Eggs';

INSERT INTO categories (name, name_fr, name_wo, description, parent_id) 
SELECT 'Chicken Feed', 'Aliments pour poulets', 'Lekk ginaar', 'Aliments spécialisés pour poulets', id FROM categories WHERE name = 'Feed';

-- ========================================
-- ÉTAPE 9 : SÉCURITÉ RLS
-- ========================================

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Politiques pour les utilisateurs
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Politiques pour les produits
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Producers can insert their own products" ON products FOR INSERT WITH CHECK (auth.uid() = producer_id);
CREATE POLICY "Producers can update their own products" ON products FOR UPDATE USING (auth.uid() = producer_id);
CREATE POLICY "Producers can delete their own products" ON products FOR DELETE USING (auth.uid() = producer_id);

-- Politiques pour les demandes de livraison
CREATE POLICY "Clients can view their own requests" ON delivery_requests FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients can insert their own requests" ON delivery_requests FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients can update their own requests" ON delivery_requests FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Distributors can view requests in their zone" ON delivery_requests FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.user_type = 'distributor'
        AND users.coordinates IS NOT NULL
        AND delivery_requests.delivery_coordinates IS NOT NULL
        AND calculate_distance(
            get_lat(users.coordinates), get_lng(users.coordinates),
            get_lat(delivery_requests.delivery_coordinates), get_lng(delivery_requests.delivery_coordinates)
        ) <= users.radius_km
    )
);

-- Politiques pour les devis
CREATE POLICY "Distributors can view their own quotes" ON quotes FOR SELECT USING (auth.uid() = distributor_id);
CREATE POLICY "Clients can view quotes for their requests" ON quotes FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Distributors can insert their own quotes" ON quotes FOR INSERT WITH CHECK (auth.uid() = distributor_id);
CREATE POLICY "Distributors can update their own quotes" ON quotes FOR UPDATE USING (auth.uid() = distributor_id);

-- Politiques pour les commandes
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = seller_id OR auth.uid() = buyer_id);
CREATE POLICY "Users can insert orders" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Sellers can update their orders" ON orders FOR UPDATE USING (auth.uid() = seller_id);

-- Politiques pour les marques
CREATE POLICY "Distributors can view their own brands" ON brands FOR SELECT USING (auth.uid() = distributor_id);
CREATE POLICY "Distributors can insert their own brands" ON brands FOR INSERT WITH CHECK (auth.uid() = distributor_id);
CREATE POLICY "Distributors can update their own brands" ON brands FOR UPDATE USING (auth.uid() = distributor_id);
CREATE POLICY "Distributors can delete their own brands" ON brands FOR DELETE USING (auth.uid() = distributor_id);

-- Politiques pour les abonnements
CREATE POLICY "Users can view their own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour les paiements
CREATE POLICY "Users can view their own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- MESSAGE DE CONFIRMATION
-- ========================================

-- Afficher un message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Base de données MATIX configurée avec succès !';
    RAISE NOTICE '📊 Tables créées : users, products, categories, delivery_requests, quotes, orders, brands, subscriptions, payments';
    RAISE NOTICE '🗺️ Fonctions géolocalisation : calculate_distance, search_products_nearby, get_requests_in_zone';
    RAISE NOTICE '🔒 Politiques RLS configurées pour la sécurité';
    RAISE NOTICE '📈 Index de performance créés';
    RAISE NOTICE '🌱 Données de base insérées (catégories)';
    RAISE NOTICE '🔧 Version corrigée avec fonctions PostgreSQL natives';
END $$;
