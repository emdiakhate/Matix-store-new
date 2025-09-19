-- Table pour gérer les messages entre distributeurs et producteurs
-- Historique des conversations et demandes

CREATE TABLE IF NOT EXISTS distributor_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    distributor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    producer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    products_of_interest TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'read', 'replied', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_distributor_messages_distributor ON distributor_messages(distributor_id);
CREATE INDEX IF NOT EXISTS idx_distributor_messages_producer ON distributor_messages(producer_id);
CREATE INDEX IF NOT EXISTS idx_distributor_messages_status ON distributor_messages(status);
CREATE INDEX IF NOT EXISTS idx_distributor_messages_created ON distributor_messages(created_at);

-- RLS (Row Level Security) - Seuls les utilisateurs concernés peuvent voir les messages
ALTER TABLE distributor_messages ENABLE ROW LEVEL SECURITY;

-- Politique : Les distributeurs peuvent voir leurs propres messages
CREATE POLICY "Distributors can view their own messages" ON distributor_messages
    FOR SELECT USING (auth.uid() = distributor_id);

-- Politique : Les distributeurs peuvent créer leurs messages
CREATE POLICY "Distributors can create messages" ON distributor_messages
    FOR INSERT WITH CHECK (auth.uid() = distributor_id);

-- Politique : Les producteurs peuvent voir les messages qui leur sont adressés
CREATE POLICY "Producers can view messages to them" ON distributor_messages
    FOR SELECT USING (auth.uid() = producer_id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_distributor_messages_updated_at 
    BEFORE UPDATE ON distributor_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vérification
SELECT 'Table distributor_messages créée avec succès' as status;






