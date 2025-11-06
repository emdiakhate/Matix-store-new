-- Drop et recréer la fonction avec producer_id

DROP FUNCTION IF EXISTS check_product_against_alerts(uuid);

CREATE OR REPLACE FUNCTION check_product_against_alerts(p_product_id UUID)
RETURNS VOID AS $$
DECLARE
  v_product RECORD;
BEGIN
  SELECT p.*, u.coordinates, u.business_name as producer_name
  FROM products p
  JOIN users u ON p.producer_id = u.id
  WHERE p.id = p_product_id
  INTO v_product;
END;
$$ LANGUAGE plpgsql;
