-- Table pour gérer les followers des producteurs
-- Permet aux distributeurs de suivre les producteurs

CREATE TABLE IF NOT EXISTS producer_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    distributor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    producer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte unique pour éviter les doublons
    UNIQUE(distributor_id, producer_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_producer_followers_distributor ON producer_followers(distributor_id);
CREATE INDEX IF NOT EXISTS idx_producer_followers_producer ON producer_followers(producer_id);
CREATE INDEX IF NOT EXISTS idx_producer_followers_created ON producer_followers(created_at);

-- RLS (Row Level Security) - Seuls les distributeurs peuvent voir leurs follows
ALTER TABLE producer_followers ENABLE ROW LEVEL SECURITY;

-- Politique : Les distributeurs peuvent voir leurs propres follows
CREATE POLICY "Distributors can view their own follows" ON producer_followers
    FOR SELECT USING (auth.uid() = distributor_id);

-- Politique : Les distributeurs peuvent créer/supprimer leurs follows
CREATE POLICY "Distributors can manage their own follows" ON producer_followers
    FOR ALL USING (auth.uid() = distributor_id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_producer_followers_updated_at 
    BEFORE UPDATE ON producer_followers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vérification
SELECT 'Table producer_followers créée avec succès' as status;






