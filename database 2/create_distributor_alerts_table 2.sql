-- Table pour gérer les alertes des distributeurs
-- Permet aux distributeurs de créer des alertes personnalisées

CREATE TABLE IF NOT EXISTS distributor_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    distributor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    criteria JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_triggered_at TIMESTAMP WITH TIME ZONE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_distributor_alerts_distributor ON distributor_alerts(distributor_id);
CREATE INDEX IF NOT EXISTS idx_distributor_alerts_active ON distributor_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_distributor_alerts_created ON distributor_alerts(created_at);

-- RLS (Row Level Security) - Seuls les distributeurs peuvent voir leurs alertes
ALTER TABLE distributor_alerts ENABLE ROW LEVEL SECURITY;

-- Politique : Les distributeurs peuvent voir leurs propres alertes
CREATE POLICY "Distributors can view their own alerts" ON distributor_alerts
    FOR SELECT USING (auth.uid() = distributor_id);

-- Politique : Les distributeurs peuvent créer/modifier leurs alertes
CREATE POLICY "Distributors can manage their own alerts" ON distributor_alerts
    FOR ALL USING (auth.uid() = distributor_id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_distributor_alerts_updated_at 
    BEFORE UPDATE ON distributor_alerts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vérification
SELECT 'Table distributor_alerts créée avec succès' as status;






