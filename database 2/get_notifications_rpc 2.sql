-- Fonction RPC pour récupérer les notifications avec enrichissement automatique
CREATE OR REPLACE FUNCTION get_notifications_rpc(
  p_user_id uuid,
  p_filter text DEFAULT 'all'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notifications json;
  notification_record RECORD;
  enriched_data jsonb;
BEGIN
  -- Récupérer les notifications et enrichir les données
  SELECT json_agg(
    CASE 
      WHEN n.type = 'proposition_received' AND n.data IS NOT NULL THEN
        json_build_object(
          'id', n.id,
          'user_id', n.user_id,
          'type', n.type,
          'title', n.title,
          'message', n.message,
          'data', COALESCE(
            -- Enrichir les données si elles sont manquantes
            CASE 
              WHEN n.data->>'product_name' IS NULL OR n.data->>'distributor_name' IS NULL THEN
                -- Récupérer les données manquantes
                (SELECT jsonb_build_object(
                  'proposition_id', n.data->>'proposition_id',
                  'product_id', n.data->>'product_id',
                  'distributor_id', n.data->>'distributor_id',
                  'product_name', COALESCE(
                    (SELECT p.name FROM products p WHERE p.id = (n.data->>'product_id')::uuid),
                    n.data->>'product_name',
                    'Produit non spécifié'
                  ),
                  'distributor_name', COALESCE(
                    (SELECT u.business_name FROM users u WHERE u.id = (n.data->>'distributor_id')::uuid),
                    n.data->>'distributor_name',
                    'Distributeur'
                  ),
                  'proposed_price', COALESCE(
                    (SELECT pr.proposed_price FROM propositions pr WHERE pr.id = (n.data->>'proposition_id')::uuid),
                    (n.data->>'proposed_price')::numeric,
                    0
                  ),
                  'quantity', COALESCE(
                    (SELECT pr.quantity FROM propositions pr WHERE pr.id = (n.data->>'proposition_id')::uuid),
                    (n.data->>'quantity')::integer,
                    0
                  ),
                  'original_price', COALESCE(
                    (SELECT p.price FROM products p WHERE p.id = (n.data->>'product_id')::uuid),
                    (n.data->>'original_price')::numeric,
                    0
                  ),
                  'message', COALESCE(
                    (SELECT pr.message FROM propositions pr WHERE pr.id = (n.data->>'proposition_id')::uuid),
                    n.data->>'message'
                  )
                ))
              ELSE n.data
            END,
            n.data
          ),
          'is_read', n.is_read,
          'created_at', n.created_at
        )
      ELSE
        json_build_object(
          'id', n.id,
          'user_id', n.user_id,
          'type', n.type,
          'title', n.title,
          'message', n.message,
          'data', n.data,
          'is_read', n.is_read,
          'created_at', n.created_at
        )
    END
  ) INTO v_notifications
  FROM notifications n
  WHERE n.user_id = p_user_id
    AND (p_filter = 'all' OR n.type = p_filter)
  ORDER BY n.created_at DESC;
  
  RETURN COALESCE(v_notifications, '[]'::json);
END;
$$;



