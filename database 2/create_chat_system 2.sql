-- Système de chat complet avec Supabase Realtime
-- Permet aux distributeurs et producteurs de communiquer en temps réel

-- 1. Table des salles de chat
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    distributor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    producer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_name TEXT NOT NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte unique pour éviter les doublons
    UNIQUE(distributor_id, producer_id)
);

-- 2. Table des messages (pour l'historique)
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'product_link')),
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table des participants (pour les notifications)
CREATE TABLE IF NOT EXISTS chat_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(room_id, user_id)
);

-- 4. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_chat_rooms_distributor ON chat_rooms(distributor_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_producer ON chat_rooms(producer_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_last_message ON chat_rooms(last_message_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_chat_participants_room ON chat_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user ON chat_participants(user_id);

-- 5. RLS simplifié pour les tests
ALTER TABLE chat_rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants DISABLE ROW LEVEL SECURITY;

-- 6. Fonction pour créer automatiquement une salle de chat
CREATE OR REPLACE FUNCTION create_or_get_chat_room(
    p_distributor_id UUID,
    p_producer_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_room_id UUID;
    v_room_name TEXT;
BEGIN
    -- Vérifier si la salle existe déjà
    SELECT id INTO v_room_id
    FROM chat_rooms
    WHERE (distributor_id = p_distributor_id AND producer_id = p_producer_id)
       OR (distributor_id = p_producer_id AND producer_id = p_distributor_id);
    
    -- Si la salle n'existe pas, la créer
    IF v_room_id IS NULL THEN
        -- Récupérer les noms des utilisateurs
        SELECT 
            d.business_name || ' ↔ ' || p.business_name
        INTO v_room_name
        FROM users d, users p
        WHERE d.id = p_distributor_id AND p.id = p_producer_id;
        
        -- Créer la salle
        INSERT INTO chat_rooms (distributor_id, producer_id, room_name)
        VALUES (p_distributor_id, p_producer_id, v_room_name)
        RETURNING id INTO v_room_id;
        
        -- Ajouter les participants
        INSERT INTO chat_participants (room_id, user_id) VALUES (v_room_id, p_distributor_id);
        INSERT INTO chat_participants (room_id, user_id) VALUES (v_room_id, p_producer_id);
    END IF;
    
    RETURN v_room_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Vérification
SELECT 'Système de chat créé avec succès' as status;






