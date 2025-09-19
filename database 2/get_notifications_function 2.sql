-- Fonction pour récupérer les notifications
CREATE OR REPLACE FUNCTION get_notifications(
  p_user_id uuid,
  p_filter text DEFAULT 'all'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notifications json;
BEGIN
  -- Récupérer les notifications
  SELECT json_agg(
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
  ) INTO v_notifications
  FROM notifications n
  WHERE n.user_id = p_user_id
    AND (p_filter = 'all' OR n.type = p_filter)
  ORDER BY n.created_at DESC;
  
  RETURN COALESCE(v_notifications, '[]'::json);
END;
$$;





