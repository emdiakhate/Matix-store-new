-- ============================================================================
-- MATIX B2B MARKETPLACE - SCHÉMA COMPLET
-- Marketplace avicole B2B au Sénégal
-- ============================================================================
-- Exécuter ce script dans Supabase SQL Editor
-- ATTENTION: Ce script supprime TOUTES les données existantes
-- ============================================================================

-- ============================================================================
-- PARTIE 1: NETTOYAGE COMPLET DE LA BASE
-- ============================================================================

-- Désactiver les triggers temporairement
SET session_replication_role = 'replica';

-- Supprimer toutes les tables existantes (ordre important pour les FK)
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_participants CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS refunds CASCADE;
DROP TABLE IF EXISTS bictorys_transactions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS proposals CASCADE;
DROP TABLE IF EXISTS distributor_alerts CASCADE;
DROP TABLE IF EXISTS distributor_requests CASCADE;
DROP TABLE IF EXISTS producer_listings CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS favorite_products CASCADE;
DROP TABLE IF EXISTS followed_producers CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Supprimer les anciennes tables si elles existent
DROP TABLE IF EXISTS brand_products CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS delivery_requests CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS product_ratings CASCADE;
DROP TABLE IF EXISTS propositions CASCADE;
DROP TABLE IF EXISTS producer_followers CASCADE;

-- Supprimer les types enum existants
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS listing_status CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;
DROP TYPE IF EXISTS proposal_status CASCADE;
DROP TYPE IF EXISTS proposal_type CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS delivery_mode CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS message_type CASCADE;
DROP TYPE IF EXISTS unit_type CASCADE;
DROP TYPE IF EXISTS alert_status CASCADE;

-- Réactiver les triggers
SET session_replication_role = 'origin';

-- ============================================================================
-- PARTIE 2: EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================================
-- PARTIE 3: TYPES ENUM
-- ============================================================================

-- Rôles utilisateur (un utilisateur peut switcher entre les deux)
CREATE TYPE user_role AS ENUM ('producer', 'distributor');

-- Unités de vente
CREATE TYPE unit_type AS ENUM ('piece', 'kg', 'lot', 'tray', 'box', 'bag');

-- Statuts des annonces producteur
CREATE TYPE listing_status AS ENUM ('active', 'sold', 'expired', 'cancelled');

-- Statuts des demandes distributeur
CREATE TYPE request_status AS ENUM ('active', 'fulfilled', 'expired', 'cancelled');

-- Statuts des alertes
CREATE TYPE alert_status AS ENUM ('active', 'paused', 'triggered', 'expired');

-- Types de propositions
CREATE TYPE proposal_type AS ENUM (
  'producer_to_request',    -- Producteur répond à une demande
  'distributor_to_listing', -- Distributeur répond à une annonce
  'distributor_to_product'  -- Distributeur fait une offre sur un produit
);

-- Statuts des propositions
CREATE TYPE proposal_status AS ENUM ('pending', 'accepted', 'rejected', 'expired', 'counter_offer');

-- Statuts de commande
CREATE TYPE order_status AS ENUM (
  'pending_payment',
  'paid',
  'confirmed',
  'preparing',
  'ready',
  'shipped',
  'delivered',
  'cancelled',
  'disputed'
);

-- Statuts de paiement
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded');

-- Méthodes de paiement Bictorys
CREATE TYPE payment_method AS ENUM ('orange_money', 'wave', 'card', 'cash_on_delivery');

-- Modes de livraison
CREATE TYPE delivery_mode AS ENUM ('pickup', 'producer_delivery', 'matix_delivery');

-- Types de notification
CREATE TYPE notification_type AS ENUM (
  'new_order',
  'order_status',
  'payment_received',
  'payment_failed',
  'proposal_received',
  'proposal_accepted',
  'proposal_rejected',
  'new_message',
  'alert_triggered',
  'listing_expired',
  'request_expired',
  'new_rating',
  'system'
);

-- Types de message
CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'product_link', 'order_link');

-- ============================================================================
-- PARTIE 4: TABLES UTILISATEURS
-- ============================================================================

-- Table principale des utilisateurs
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  active_role user_role NOT NULL DEFAULT 'producer',
  is_producer_enabled BOOLEAN NOT NULL DEFAULT true,
  is_distributor_enabled BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profils utilisateurs (informations détaillées)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Informations personnelles
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  avatar_url TEXT,

  -- Informations entreprise
  business_name VARCHAR(255),
  business_description TEXT,
  ninea VARCHAR(50), -- Numéro d'identification (optionnel)

  -- Localisation
  address TEXT,
  city VARCHAR(100),
  region VARCHAR(100) NOT NULL DEFAULT 'Dakar',
  coordinates GEOGRAPHY(POINT, 4326), -- Coordonnées GPS réelles

  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Paramètres utilisateur
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Notifications
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  sms_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,

  -- Préférences
  language VARCHAR(5) NOT NULL DEFAULT 'fr',
  currency VARCHAR(3) NOT NULL DEFAULT 'XOF',

  -- Zone de service (pour distributeurs)
  service_radius_km INTEGER DEFAULT 50,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id)
);

-- ============================================================================
-- PARTIE 5: TABLES CATALOGUE
-- ============================================================================

-- Catégories de produits avicoles
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(50) NOT NULL UNIQUE,
  name_fr VARCHAR(100) NOT NULL,
  name_wo VARCHAR(100), -- Wolof
  description_fr TEXT,
  icon VARCHAR(10), -- Emoji
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Produits du catalogue producteur
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id),

  -- Informations produit
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Prix et unités
  price DECIMAL(12, 2) NOT NULL,
  unit_type unit_type NOT NULL DEFAULT 'piece',
  min_order_quantity INTEGER NOT NULL DEFAULT 1,

  -- Stock
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,

  -- Caractéristiques avicoles
  is_organic BOOLEAN DEFAULT false,
  is_local_breed BOOLEAN DEFAULT false,
  age_weeks INTEGER, -- Âge en semaines (pour volailles)
  vaccination_status TEXT,
  origin VARCHAR(100), -- Origine/Ferme

  -- Certifications
  certifications TEXT[], -- Array de certifications

  -- Saisonnalité
  is_seasonal BOOLEAN DEFAULT false,
  season_start INTEGER, -- Mois de début (1-12)
  season_end INTEGER, -- Mois de fin (1-12)

  -- Image principale
  image_url TEXT,

  -- Localisation
  location_coordinates GEOGRAPHY(POINT, 4326),

  -- Métadonnées
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Images supplémentaires des produits
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- PARTIE 6: TABLES ANNONCES & DEMANDES
-- ============================================================================

-- Annonces de disponibilité (Producteur publie)
CREATE TABLE producer_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  -- Détails de l'annonce
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Quantité et prix
  quantity_available INTEGER NOT NULL,
  unit_type unit_type NOT NULL,
  price_per_unit DECIMAL(12, 2) NOT NULL,
  is_negotiable BOOLEAN NOT NULL DEFAULT true,

  -- Validité
  expires_at TIMESTAMPTZ NOT NULL,

  -- Zone de livraison
  delivery_zones TEXT[], -- Régions couvertes

  -- Statut
  status listing_status NOT NULL DEFAULT 'active',

  -- Métadonnées
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Demandes de produits (Distributeur publie)
CREATE TABLE distributor_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  distributor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),

  -- Détails de la demande
  title VARCHAR(255) NOT NULL,
  description TEXT,
  product_name VARCHAR(255), -- Nom du produit recherché

  -- Quantité et budget
  quantity_needed INTEGER NOT NULL,
  unit_type unit_type NOT NULL,
  budget_min DECIMAL(12, 2),
  budget_max DECIMAL(12, 2),

  -- Date souhaitée
  needed_by TIMESTAMPTZ,

  -- Validité
  expires_at TIMESTAMPTZ NOT NULL,

  -- Localisation
  delivery_region VARCHAR(100),
  delivery_address TEXT,
  delivery_coordinates GEOGRAPHY(POINT, 4326),

  -- Statut
  status request_status NOT NULL DEFAULT 'active',

  -- Compteurs
  proposals_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alertes produits (Distributeur configure)
CREATE TABLE distributor_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  distributor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Critères de l'alerte
  category_id UUID REFERENCES categories(id),
  product_keywords TEXT[], -- Mots-clés
  max_price DECIMAL(12, 2),
  min_quantity INTEGER,
  regions TEXT[], -- Régions d'intérêt
  producer_id UUID REFERENCES users(id), -- Producteur spécifique (optionnel)

  -- Configuration
  name VARCHAR(255) NOT NULL,
  status alert_status NOT NULL DEFAULT 'active',

  -- Statistiques
  times_triggered INTEGER NOT NULL DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Propositions (bidirectionnelles)
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Acteurs
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Type et références
  proposal_type proposal_type NOT NULL,
  listing_id UUID REFERENCES producer_listings(id) ON DELETE SET NULL,
  request_id UUID REFERENCES distributor_requests(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,

  -- Détails de l'offre
  proposed_price DECIMAL(12, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_type unit_type NOT NULL,
  message TEXT,

  -- Conditions
  delivery_mode delivery_mode,
  delivery_date TIMESTAMPTZ,
  validity_hours INTEGER NOT NULL DEFAULT 48,

  -- Statut
  status proposal_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,

  -- Réponse
  response_message TEXT,
  responded_at TIMESTAMPTZ,

  -- Contre-offre (si applicable)
  counter_price DECIMAL(12, 2),
  counter_quantity INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- PARTIE 7: TABLES COMMANDES & PAIEMENTS
-- ============================================================================

-- Commandes
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(20) NOT NULL UNIQUE,

  -- Acteurs
  producer_id UUID NOT NULL REFERENCES users(id),
  distributor_id UUID NOT NULL REFERENCES users(id),

  -- Référence proposition (optionnel)
  proposal_id UUID REFERENCES proposals(id),

  -- Statut
  status order_status NOT NULL DEFAULT 'pending_payment',

  -- Montants
  subtotal DECIMAL(12, 2) NOT NULL,
  delivery_fee DECIMAL(12, 2) NOT NULL DEFAULT 0,
  platform_fee DECIMAL(12, 2) NOT NULL DEFAULT 0, -- 2% Matix
  total_amount DECIMAL(12, 2) NOT NULL,

  -- Livraison
  delivery_mode delivery_mode NOT NULL,
  delivery_address TEXT,
  delivery_region VARCHAR(100),
  delivery_coordinates GEOGRAPHY(POINT, 4326),
  estimated_delivery_date TIMESTAMPTZ,
  actual_delivery_date TIMESTAMPTZ,

  -- Notes
  producer_notes TEXT,
  distributor_notes TEXT,

  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lignes de commande
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),

  -- Détails
  product_name VARCHAR(255) NOT NULL, -- Snapshot du nom
  quantity INTEGER NOT NULL,
  unit_type unit_type NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Paiements
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Montant
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'XOF',

  -- Méthode
  payment_method payment_method NOT NULL,

  -- Statut
  status payment_status NOT NULL DEFAULT 'pending',

  -- Bictorys
  bictorys_charge_id VARCHAR(255), -- ID de la charge Bictorys
  bictorys_transaction_id VARCHAR(255), -- ID de la transaction

  -- Données complètes Bictorys
  bictorys_response JSONB,

  -- Timestamps
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions Bictorys (historique complet)
CREATE TABLE bictorys_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES payments(id),

  -- Identifiants Bictorys
  charge_id VARCHAR(255),
  transaction_id VARCHAR(255),

  -- Type d'opération
  operation_type VARCHAR(50) NOT NULL, -- 'charge', 'refund', 'payout'

  -- Montants
  amount DECIMAL(12, 2) NOT NULL,
  fees DECIMAL(12, 2) DEFAULT 0,
  net_amount DECIMAL(12, 2),

  -- Statut
  status VARCHAR(50) NOT NULL,

  -- Données brutes
  request_data JSONB,
  response_data JSONB,
  webhook_data JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Remboursements
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES payments(id),
  order_id UUID NOT NULL REFERENCES orders(id),

  -- Montant
  amount DECIMAL(12, 2) NOT NULL,
  reason TEXT,

  -- Bictorys
  bictorys_refund_id VARCHAR(255),

  -- Statut
  status payment_status NOT NULL DEFAULT 'pending',

  -- Initié par
  initiated_by UUID NOT NULL REFERENCES users(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- PARTIE 8: TABLES COMMUNICATION
-- ============================================================================

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Contenu
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  -- Données contextuelles
  data JSONB DEFAULT '{}',

  -- Références (optionnelles)
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES producer_listings(id) ON DELETE SET NULL,
  request_id UUID REFERENCES distributor_requests(id) ON DELETE SET NULL,

  -- Statut
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Salons de chat
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Participants
  producer_id UUID NOT NULL REFERENCES users(id),
  distributor_id UUID NOT NULL REFERENCES users(id),

  -- Métadonnées
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,

  -- Compteurs de non-lus
  producer_unread_count INTEGER NOT NULL DEFAULT 0,
  distributor_unread_count INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(producer_id, distributor_id)
);

-- Messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),

  -- Contenu
  message_type message_type NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,

  -- Métadonnées (pour fichiers, liens produits, etc.)
  metadata JSONB DEFAULT '{}',

  -- Statut
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- PARTIE 9: TABLES ÉVALUATIONS & FAVORIS
-- ============================================================================

-- Évaluations
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Qui évalue qui
  rater_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rated_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Commande associée
  order_id UUID NOT NULL REFERENCES orders(id),

  -- Évaluation
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,

  -- Réponse (optionnelle)
  response TEXT,
  responded_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(rater_id, order_id)
);

-- Produits favoris
CREATE TABLE favorite_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, product_id)
);

-- Producteurs suivis
CREATE TABLE followed_producers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  distributor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  producer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(distributor_id, producer_id)
);

-- ============================================================================
-- PARTIE 10: INDEXES
-- ============================================================================

-- Users
CREATE INDEX idx_users_active_role ON users(active_role);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_region ON user_profiles(region);
CREATE INDEX idx_user_profiles_coordinates ON user_profiles USING GIST(coordinates);

-- Products
CREATE INDEX idx_products_producer_id ON products(producer_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_available ON products(is_available);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_coordinates ON products USING GIST(location_coordinates);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Listings
CREATE INDEX idx_producer_listings_producer_id ON producer_listings(producer_id);
CREATE INDEX idx_producer_listings_product_id ON producer_listings(product_id);
CREATE INDEX idx_producer_listings_status ON producer_listings(status);
CREATE INDEX idx_producer_listings_expires_at ON producer_listings(expires_at);

-- Requests
CREATE INDEX idx_distributor_requests_distributor_id ON distributor_requests(distributor_id);
CREATE INDEX idx_distributor_requests_category_id ON distributor_requests(category_id);
CREATE INDEX idx_distributor_requests_status ON distributor_requests(status);
CREATE INDEX idx_distributor_requests_expires_at ON distributor_requests(expires_at);
CREATE INDEX idx_distributor_requests_coordinates ON distributor_requests USING GIST(delivery_coordinates);

-- Proposals
CREATE INDEX idx_proposals_sender_id ON proposals(sender_id);
CREATE INDEX idx_proposals_receiver_id ON proposals(receiver_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_expires_at ON proposals(expires_at);

-- Orders
CREATE INDEX idx_orders_producer_id ON orders(producer_id);
CREATE INDEX idx_orders_distributor_id ON orders(distributor_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Payments
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_bictorys_charge_id ON payments(bictorys_charge_id);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Chat
CREATE INDEX idx_chat_rooms_producer_id ON chat_rooms(producer_id);
CREATE INDEX idx_chat_rooms_distributor_id ON chat_rooms(distributor_id);
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Ratings
CREATE INDEX idx_ratings_rated_user_id ON ratings(rated_user_id);
CREATE INDEX idx_ratings_order_id ON ratings(order_id);

-- Favorites & Follows
CREATE INDEX idx_favorite_products_user_id ON favorite_products(user_id);
CREATE INDEX idx_followed_producers_distributor_id ON followed_producers(distributor_id);
CREATE INDEX idx_followed_producers_producer_id ON followed_producers(producer_id);

-- ============================================================================
-- PARTIE 11: FONCTIONS UTILITAIRES
-- ============================================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer un numéro de commande
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    new_number := 'MTX-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                  UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
    SELECT EXISTS(SELECT 1 FROM orders WHERE order_number = new_number) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer la distance entre deux points
CREATE OR REPLACE FUNCTION calculate_distance(
  point1 GEOGRAPHY,
  point2 GEOGRAPHY
)
RETURNS DECIMAL AS $$
BEGIN
  RETURN ST_Distance(point1, point2) / 1000; -- Retourne en km
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir la note moyenne d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_average_rating(user_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  avg_rating DECIMAL;
BEGIN
  SELECT ROUND(AVG(rating)::DECIMAL, 2) INTO avg_rating
  FROM ratings
  WHERE rated_user_id = user_uuid;

  RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer une notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title VARCHAR(255),
  p_message TEXT,
  p_data JSONB DEFAULT '{}',
  p_order_id UUID DEFAULT NULL,
  p_proposal_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data, order_id, proposal_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_data, p_order_id, p_proposal_id)
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PARTIE 12: TRIGGERS
-- ============================================================================

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_producer_listings_updated_at BEFORE UPDATE ON producer_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_distributor_requests_updated_at BEFORE UPDATE ON distributor_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_distributor_alerts_updated_at BEFORE UPDATE ON distributor_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON chat_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour générer le numéro de commande
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- Trigger pour incrémenter le compteur de propositions sur une demande
CREATE OR REPLACE FUNCTION increment_request_proposals()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.request_id IS NOT NULL THEN
    UPDATE distributor_requests
    SET proposals_count = proposals_count + 1
    WHERE id = NEW.request_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_proposals AFTER INSERT ON proposals
  FOR EACH ROW EXECUTE FUNCTION increment_request_proposals();

-- ============================================================================
-- PARTIE 13: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE producer_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributor_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributor_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bictorys_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE followed_producers ENABLE ROW LEVEL SECURITY;

-- Politiques pour users
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Politiques pour user_profiles
CREATE POLICY "Profiles are viewable by everyone" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour user_settings
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour categories
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

-- Politiques pour products
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Producers can insert own products" ON products FOR INSERT WITH CHECK (auth.uid() = producer_id);
CREATE POLICY "Producers can update own products" ON products FOR UPDATE USING (auth.uid() = producer_id);
CREATE POLICY "Producers can delete own products" ON products FOR DELETE USING (auth.uid() = producer_id);

-- Politiques pour product_images
CREATE POLICY "Product images are viewable by everyone" ON product_images FOR SELECT USING (true);
CREATE POLICY "Producers can manage product images" ON product_images FOR ALL
  USING (EXISTS (SELECT 1 FROM products WHERE products.id = product_images.product_id AND products.producer_id = auth.uid()));

-- Politiques pour producer_listings
CREATE POLICY "Listings are viewable by everyone" ON producer_listings FOR SELECT USING (true);
CREATE POLICY "Producers can manage own listings" ON producer_listings FOR ALL USING (auth.uid() = producer_id);

-- Politiques pour distributor_requests
CREATE POLICY "Requests are viewable by everyone" ON distributor_requests FOR SELECT USING (true);
CREATE POLICY "Distributors can manage own requests" ON distributor_requests FOR ALL USING (auth.uid() = distributor_id);

-- Politiques pour distributor_alerts
CREATE POLICY "Users can view own alerts" ON distributor_alerts FOR SELECT USING (auth.uid() = distributor_id);
CREATE POLICY "Users can manage own alerts" ON distributor_alerts FOR ALL USING (auth.uid() = distributor_id);

-- Politiques pour proposals
CREATE POLICY "Users can view proposals they're involved in" ON proposals FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can create proposals" ON proposals FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update proposals they received" ON proposals FOR UPDATE
  USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

-- Politiques pour orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT
  USING (auth.uid() = producer_id OR auth.uid() = distributor_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT
  WITH CHECK (auth.uid() = distributor_id);
CREATE POLICY "Users can update own orders" ON orders FOR UPDATE
  USING (auth.uid() = producer_id OR auth.uid() = distributor_id);

-- Politiques pour order_items
CREATE POLICY "Users can view order items" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id
    AND (orders.producer_id = auth.uid() OR orders.distributor_id = auth.uid())));
CREATE POLICY "Users can insert order items" ON order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id
    AND orders.distributor_id = auth.uid()));

-- Politiques pour payments
CREATE POLICY "Users can view payments for their orders" ON payments FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = payments.order_id
    AND (orders.producer_id = auth.uid() OR orders.distributor_id = auth.uid())));
CREATE POLICY "System can insert payments" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update payments" ON payments FOR UPDATE USING (true);

-- Politiques pour bictorys_transactions
CREATE POLICY "Users can view their transactions" ON bictorys_transactions FOR SELECT
  USING (EXISTS (SELECT 1 FROM payments p JOIN orders o ON p.order_id = o.id
    WHERE p.id = bictorys_transactions.payment_id
    AND (o.producer_id = auth.uid() OR o.distributor_id = auth.uid())));

-- Politiques pour refunds
CREATE POLICY "Users can view refunds for their orders" ON refunds FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = refunds.order_id
    AND (orders.producer_id = auth.uid() OR orders.distributor_id = auth.uid())));

-- Politiques pour notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Politiques pour chat_rooms
CREATE POLICY "Users can view own chat rooms" ON chat_rooms FOR SELECT
  USING (auth.uid() = producer_id OR auth.uid() = distributor_id);
CREATE POLICY "Users can create chat rooms" ON chat_rooms FOR INSERT
  WITH CHECK (auth.uid() = producer_id OR auth.uid() = distributor_id);
CREATE POLICY "Users can update own chat rooms" ON chat_rooms FOR UPDATE
  USING (auth.uid() = producer_id OR auth.uid() = distributor_id);

-- Politiques pour chat_messages
CREATE POLICY "Users can view messages in their rooms" ON chat_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM chat_rooms WHERE chat_rooms.id = chat_messages.room_id
    AND (chat_rooms.producer_id = auth.uid() OR chat_rooms.distributor_id = auth.uid())));
CREATE POLICY "Users can send messages" ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM chat_rooms WHERE chat_rooms.id = chat_messages.room_id
    AND (chat_rooms.producer_id = auth.uid() OR chat_rooms.distributor_id = auth.uid())));
CREATE POLICY "Users can update own messages" ON chat_messages FOR UPDATE
  USING (EXISTS (SELECT 1 FROM chat_rooms WHERE chat_rooms.id = chat_messages.room_id
    AND (chat_rooms.producer_id = auth.uid() OR chat_rooms.distributor_id = auth.uid())));

-- Politiques pour ratings
CREATE POLICY "Ratings are viewable by everyone" ON ratings FOR SELECT USING (true);
CREATE POLICY "Users can create ratings" ON ratings FOR INSERT WITH CHECK (auth.uid() = rater_id);
CREATE POLICY "Users can update own ratings" ON ratings FOR UPDATE USING (auth.uid() = rater_id OR auth.uid() = rated_user_id);

-- Politiques pour favorite_products
CREATE POLICY "Users can view own favorites" ON favorite_products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own favorites" ON favorite_products FOR ALL USING (auth.uid() = user_id);

-- Politiques pour followed_producers
CREATE POLICY "Users can view own follows" ON followed_producers FOR SELECT USING (auth.uid() = distributor_id);
CREATE POLICY "Users can manage own follows" ON followed_producers FOR ALL USING (auth.uid() = distributor_id);

-- ============================================================================
-- PARTIE 14: DONNÉES INITIALES - CATÉGORIES
-- ============================================================================

INSERT INTO categories (slug, name_fr, name_wo, description_fr, icon, display_order) VALUES
  ('poultry', 'Volailles Vivantes', 'Ginaar yu dund', 'Poulets, poules, dindes et autres volailles', '🐔', 1),
  ('eggs', 'Œufs & Reproduction', 'Nee', 'Œufs frais, œufs à couver, œufs bio', '🥚', 2),
  ('chicks', 'Poussins', 'Cuuj', 'Poussins de chair, poussins pondeuses, reproducteurs', '🐣', 3),
  ('feeders', 'Mangeoires & Abreuvoirs', 'Jëfandikukay lekk', 'Équipements d''alimentation et d''abreuvement', '🍽️', 4),
  ('equipment', 'Équipements Élevage', 'Jëfandikukay', 'Équipements et infrastructures d''élevage', '🏠', 5),
  ('feed', 'Aliments & Nutrition', 'Lekk', 'Aliments pour volailles, compléments nutritionnels', '🌾', 6),
  ('veterinary', 'Soins Vétérinaires', 'Faju', 'Vaccins, médicaments, soins de santé', '💉', 7),
  ('hygiene', 'Hygiène & Nettoyage', 'Setlu', 'Produits d''hygiène et de nettoyage', '🧽', 8),
  ('packaging', 'Conditionnement', 'Mbalaas', 'Emballages et matériel de conditionnement', '📦', 9);

-- ============================================================================
-- PARTIE 15: STORAGE BUCKETS
-- ============================================================================

-- Créer les buckets de stockage
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('products', 'products', true),
  ('chat-files', 'chat-files', false)
ON CONFLICT (id) DO NOTHING;

-- Politiques de stockage pour avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Politiques de stockage pour products
CREATE POLICY "Product images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Producers can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'products' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Producers can update product images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'products' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Producers can delete product images" ON storage.objects
  FOR DELETE USING (bucket_id = 'products' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Politiques de stockage pour chat-files
CREATE POLICY "Chat files accessible by room participants" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can upload chat files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

-- Vérification finale
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

  RAISE NOTICE '✅ Schéma MATIX créé avec succès!';
  RAISE NOTICE '📊 Nombre de tables créées: %', table_count;
  RAISE NOTICE '🐔 9 catégories avicoles insérées';
  RAISE NOTICE '🔐 RLS activé sur toutes les tables';
  RAISE NOTICE '📁 3 buckets de stockage configurés';
END $$;
