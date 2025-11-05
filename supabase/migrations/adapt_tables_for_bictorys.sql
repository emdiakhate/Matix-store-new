-- Migration: Adaptation des tables existantes pour Bictorys
-- Date: 2025-11-05
-- IMPORTANT: Cette migration modifie les tables orders et payments existantes

-- ============================================
-- ÉTAPE 1: Ajouter les colonnes manquantes à la table orders
-- ============================================

-- Ajouter les champs nécessaires pour les commandes e-commerce
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS shipping_address JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS shipping_method VARCHAR(100),
ADD COLUMN IF NOT EXISTS payment_method_details VARCHAR(100);

-- Commentaires
COMMENT ON COLUMN public.orders.customer_email IS 'Email du client pour les commandes e-commerce';
COMMENT ON COLUMN public.orders.customer_phone IS 'Téléphone du client';
COMMENT ON COLUMN public.orders.customer_name IS 'Nom complet du client';
COMMENT ON COLUMN public.orders.items IS 'Articles commandés au format JSON';
COMMENT ON COLUMN public.orders.shipping_address IS 'Adresse de livraison au format JSON';
COMMENT ON COLUMN public.orders.shipping_method IS 'Méthode de livraison (UPS, DHL, etc.)';

-- ============================================
-- ÉTAPE 2: Ajouter les colonnes manquantes à la table payments
-- ============================================

-- Ajouter les champs nécessaires pour Bictorys
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS reference VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS bictorys_transaction_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS bictorys_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_url TEXT;

-- Index pour Bictorys
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_bictorys_transaction_id ON public.payments(bictorys_transaction_id);

-- Commentaires
COMMENT ON COLUMN public.payments.reference IS 'Référence unique pour Bictorys (format: MATIX-{order_id}-{timestamp})';
COMMENT ON COLUMN public.payments.bictorys_transaction_id IS 'ID de transaction retourné par Bictorys';
COMMENT ON COLUMN public.payments.bictorys_status IS 'Statut du paiement Bictorys (pending, success, failed, cancelled)';
COMMENT ON COLUMN public.payments.payment_url IS 'URL de redirection vers la page de paiement Bictorys';
COMMENT ON COLUMN public.payments.metadata IS 'Métadonnées additionnelles (cart_items, shipping_info, etc.)';

-- ============================================
-- ÉTAPE 3: Vérifier et afficher les types ENUM existants
-- ============================================

-- Pour voir les valeurs des ENUM (à exécuter séparément pour vérifier)
-- SELECT enum_range(NULL::order_status);
-- SELECT enum_range(NULL::payment_status);
-- SELECT enum_range(NULL::payment_method);
-- SELECT enum_range(NULL::user_type);

-- ============================================
-- ÉTAPE 4: Ajouter des valeurs ENUM si nécessaire
-- ============================================

-- Si les valeurs Bictorys ne sont pas dans les ENUM, les ajouter
-- Note: Vous devez d'abord vérifier les valeurs existantes avec les requêtes ci-dessus

-- Exemple pour payment_status (à adapter selon vos valeurs actuelles):
-- DO $$
-- BEGIN
--     IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'success' AND enumtypid = 'payment_status'::regtype) THEN
--         ALTER TYPE payment_status ADD VALUE 'success';
--     END IF;
--     IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'cancelled' AND enumtypid = 'payment_status'::regtype) THEN
--         ALTER TYPE payment_status ADD VALUE 'cancelled';
--     END IF;
-- END
-- $$;

-- ============================================
-- ÉTAPE 5: Table pour le panier (si elle n'existe pas)
-- ============================================

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255), -- Pour les utilisateurs non connectés
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_add NUMERIC NOT NULL, -- Prix au moment de l'ajout
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT cart_items_unique_product UNIQUE(user_id, product_id, session_id)
);

-- Index pour le panier
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON public.cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_cart_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_cart_items_updated_at_trigger ON public.cart_items;
CREATE TRIGGER update_cart_items_updated_at_trigger
    BEFORE UPDATE ON public.cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_cart_items_updated_at();

-- RLS pour le panier
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Politique temporaire pour le développement
DROP POLICY IF EXISTS "Allow all for development" ON public.cart_items;
CREATE POLICY "Allow all for development" ON public.cart_items FOR ALL USING (true);

-- Commentaires
COMMENT ON TABLE public.cart_items IS 'Panier d''achat des utilisateurs (connectés et invités)';
COMMENT ON COLUMN public.cart_items.session_id IS 'ID de session pour les utilisateurs non connectés';
COMMENT ON COLUMN public.cart_items.price_at_add IS 'Prix du produit au moment de l''ajout au panier';

-- ============================================
-- RÉSUMÉ DE LA MIGRATION
-- ============================================

-- Tables modifiées:
-- ✅ orders: ajout de customer_email, customer_phone, customer_name, items, shipping_address, shipping_method
-- ✅ payments: ajout de reference, customer_email, customer_phone, customer_name, metadata, bictorys_transaction_id, bictorys_status, payment_url
-- ✅ cart_items: nouvelle table créée pour gérer le panier

-- Prochaines étapes:
-- 1. Exécuter cette migration dans Supabase SQL Editor
-- 2. Vérifier les types ENUM avec les requêtes commentées
-- 3. Ajouter les valeurs ENUM manquantes si nécessaire
-- 4. Tester la création d'une commande
-- 5. Tester le paiement avec Bictorys
