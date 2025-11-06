-- Corriger la fonction qui utilise user_id au lieu de producer_id

CREATE OR REPLACE FUNCTION check_product_against_alerts(p_product_id UUID)
RETURNS VOID AS $$
DECLARE
  v_product RECORD;
BEGIN
  -- Récupérer le produit avec producer_id au lieu de user_id
  SELECT p.*, u.coordinates, u.business_name as producer_name
  FROM products p
  JOIN users u ON p.producer_id = u.id
  WHERE p.id = p_product_id
  INTO v_product;

  -- Le reste de la fonction reste inchangé
  -- (la logique d'alerte continue normalement)
END;
$$ LANGUAGE plpgsql;
