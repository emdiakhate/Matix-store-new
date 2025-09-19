-- =====================================================
-- SYSTÈME DE PROPOSITIONS DISTRIBUTEUR → PRODUCTEUR
-- =====================================================

-- 1. Créer la table propositions
CREATE TABLE IF NOT EXISTS public.propositions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  producer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  proposed_price numeric(10,2) NOT NULL CHECK (proposed_price > 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  message text,
  status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  expires_at timestamp with time zone DEFAULT (now() + interval '7 days'),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  responded_at timestamp with time zone,
  response_message text
);

-- 2. Créer les index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_propositions_distributor_id ON propositions(distributor_id);
CREATE INDEX IF NOT EXISTS idx_propositions_producer_id ON propositions(producer_id);
CREATE INDEX IF NOT EXISTS idx_propositions_product_id ON propositions(product_id);
CREATE INDEX IF NOT EXISTS idx_propositions_status ON propositions(status);
CREATE INDEX IF NOT EXISTS idx_propositions_expires_at ON propositions(expires_at);
CREATE INDEX IF NOT EXISTS idx_propositions_created_at ON propositions(created_at);

-- 3. Créer la table notifications si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type varchar(50) NOT NULL,
  title varchar(255) NOT NULL,
  message text NOT NULL,
  data jsonb,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Index pour les notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- 4. Désactiver RLS temporairement pour la configuration
ALTER TABLE propositions DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- 5. Créer les politiques RLS pour propositions
DROP POLICY IF EXISTS "Distributors can view their sent propositions" ON propositions;
DROP POLICY IF EXISTS "Producers can view their received propositions" ON propositions;
DROP POLICY IF EXISTS "Distributors can create propositions" ON propositions;
DROP POLICY IF EXISTS "Producers can update their propositions" ON propositions;

CREATE POLICY "Distributors can view their sent propositions" ON propositions
  FOR SELECT USING (
    distributor_id = auth.uid() OR 
    producer_id = auth.uid()
  );

CREATE POLICY "Distributors can create propositions" ON propositions
  FOR INSERT WITH CHECK (
    distributor_id = auth.uid()
  );

CREATE POLICY "Producers can update their propositions" ON propositions
  FOR UPDATE USING (
    producer_id = auth.uid()
  );

-- 6. Créer les politiques RLS pour notifications
DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;

CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- 7. Réactiver RLS
ALTER TABLE propositions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 8. Créer un trigger pour updated_at
CREATE OR REPLACE FUNCTION update_propositions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_propositions_updated_at ON propositions;
CREATE TRIGGER update_propositions_updated_at
  BEFORE UPDATE ON propositions
  FOR EACH ROW
  EXECUTE FUNCTION update_propositions_updated_at();

-- 9. Fonction pour créer une notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type varchar(50),
  p_title varchar(255),
  p_message text,
  p_data jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Fonction pour marquer les propositions expirées
CREATE OR REPLACE FUNCTION mark_expired_propositions()
RETURNS void AS $$
BEGIN
  UPDATE propositions 
  SET status = 'expired', updated_at = now()
  WHERE status = 'pending' 
    AND expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Fonction pour créer une proposition avec notification automatique
CREATE OR REPLACE FUNCTION create_proposition_with_notification(
  p_distributor_id uuid,
  p_producer_id uuid,
  p_product_id uuid,
  p_proposed_price numeric,
  p_quantity integer,
  p_message text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  proposition_id uuid;
  product_name text;
  distributor_name text;
  notification_data jsonb;
BEGIN
  -- Créer la proposition
  INSERT INTO propositions (
    distributor_id, producer_id, product_id, 
    proposed_price, quantity, message
  )
  VALUES (
    p_distributor_id, p_producer_id, p_product_id,
    p_proposed_price, p_quantity, p_message
  )
  RETURNING id INTO proposition_id;
  
  -- Récupérer les informations pour la notification
  SELECT p.name, u.business_name
  INTO product_name, distributor_name
  FROM products p
  JOIN users u ON u.id = p_distributor_id
  WHERE p.id = p_product_id;
  
  -- Préparer les données de notification
  notification_data := jsonb_build_object(
    'proposition_id', proposition_id,
    'product_id', p_product_id,
    'product_name', product_name,
    'distributor_name', distributor_name,
    'proposed_price', p_proposed_price,
    'quantity', p_quantity
  );
  
  -- Créer la notification pour le producteur
  PERFORM create_notification(
    p_producer_id,
    'proposition_received',
    'Nouvelle proposition reçue',
    'Vous avez reçu une nouvelle proposition pour "' || product_name || '" de ' || distributor_name,
    notification_data
  );
  
  RETURN proposition_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Fonction pour répondre à une proposition avec notification
CREATE OR REPLACE FUNCTION respond_to_proposition(
  p_proposition_id uuid,
  p_status varchar(20),
  p_response_message text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  proposition_record propositions%ROWTYPE;
  notification_data jsonb;
BEGIN
  -- Récupérer la proposition
  SELECT * INTO proposition_record
  FROM propositions
  WHERE id = p_proposition_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Proposition non trouvée';
  END IF;
  
  -- Mettre à jour la proposition
  UPDATE propositions
  SET 
    status = p_status,
    response_message = p_response_message,
    responded_at = now(),
    updated_at = now()
  WHERE id = p_proposition_id;
  
  -- Préparer les données de notification
  notification_data := jsonb_build_object(
    'proposition_id', p_proposition_id,
    'product_id', proposition_record.product_id,
    'status', p_status
  );
  
  -- Créer la notification pour le distributeur
  IF p_status = 'accepted' THEN
    PERFORM create_notification(
      proposition_record.distributor_id,
      'proposition_accepted',
      'Proposition acceptée',
      'Votre proposition a été acceptée par le producteur',
      notification_data
    );
  ELSIF p_status = 'rejected' THEN
    PERFORM create_notification(
      proposition_record.distributor_id,
      'proposition_rejected',
      'Proposition refusée',
      'Votre proposition a été refusée par le producteur',
      notification_data
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Données de test (optionnel)
-- INSERT INTO propositions (distributor_id, producer_id, product_id, proposed_price, quantity, message)
-- VALUES (
--   'b9e68c20-60df-40d9-9a35-1df76838bc29', -- distributeur
--   '267060b0-13d5-4fa9-a414-dbc1e533f05b', -- producteur
--   (SELECT id FROM products LIMIT 1), -- premier produit
--   4500, -- prix proposé
--   10, -- quantité
--   'Bonjour, je suis intéressé par ce produit. Pouvez-vous me faire un prix pour 10 unités ?'
-- );

-- 14. Vérification finale
SELECT 'Tables créées avec succès' as status;
SELECT 'Politiques RLS configurées' as rls_status;
SELECT 'Fonctions créées' as functions_status;





