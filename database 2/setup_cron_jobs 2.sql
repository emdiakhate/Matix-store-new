-- =====================================================
-- TÂCHES AUTOMATIQUES POUR LE SYSTÈME DE PROPOSITIONS
-- =====================================================

-- 1. Fonction pour nettoyer les propositions expirées
CREATE OR REPLACE FUNCTION cleanup_expired_propositions()
RETURNS void AS $$
DECLARE
  expired_count integer;
BEGIN
  -- Marquer les propositions expirées
  UPDATE propositions 
  SET status = 'expired', updated_at = now()
  WHERE status = 'pending' 
    AND expires_at < now();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  -- Log de l'opération
  RAISE NOTICE 'Propositions expirées marquées: %', expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fonction pour créer des notifications d'expiration
CREATE OR REPLACE FUNCTION notify_expired_propositions()
RETURNS void AS $$
DECLARE
  proposition_record RECORD;
BEGIN
  -- Récupérer les propositions qui viennent d'expirer (dans la dernière heure)
  FOR proposition_record IN
    SELECT 
      p.id,
      p.distributor_id,
      p.producer_id,
      pr.name as product_name,
      d.business_name as distributor_name,
      pr.business_name as producer_name
    FROM propositions p
    JOIN products pr ON pr.id = p.product_id
    JOIN users d ON d.id = p.distributor_id
    JOIN users pr ON pr.id = p.producer_id
    WHERE p.status = 'expired'
      AND p.updated_at > now() - interval '1 hour'
  LOOP
    -- Notification au distributeur
    PERFORM create_notification(
      proposition_record.distributor_id,
      'proposition_expired',
      'Proposition expirée',
      'Votre proposition pour "' || proposition_record.product_name || '" a expiré sans réponse du producteur.',
      jsonb_build_object(
        'proposition_id', proposition_record.id,
        'product_name', proposition_record.product_name,
        'producer_name', proposition_record.producer_name
      )
    );
    
    -- Notification au producteur
    PERFORM create_notification(
      proposition_record.producer_id,
      'proposition_expired',
      'Proposition expirée',
      'La proposition de ' || proposition_record.distributor_name || ' pour "' || proposition_record.product_name || '" a expiré.',
      jsonb_build_object(
        'proposition_id', proposition_record.id,
        'product_name', proposition_record.product_name,
        'distributor_name', proposition_record.distributor_name
      )
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Fonction pour nettoyer les anciennes notifications (plus de 30 jours)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM notifications 
  WHERE created_at < now() - interval '30 days'
    AND is_read = true;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE 'Notifications anciennes supprimées: %', deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Fonction principale de maintenance
CREATE OR REPLACE FUNCTION run_daily_maintenance()
RETURNS void AS $$
BEGIN
  -- Nettoyer les propositions expirées
  PERFORM cleanup_expired_propositions();
  
  -- Créer les notifications d'expiration
  PERFORM notify_expired_propositions();
  
  -- Nettoyer les anciennes notifications
  PERFORM cleanup_old_notifications();
  
  RAISE NOTICE 'Maintenance quotidienne terminée à %', now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Créer un événement pour exécuter la maintenance quotidienne
-- Note: Cette syntaxe peut varier selon la version de PostgreSQL
-- Pour Supabase, utilisez plutôt les cron jobs via l'interface web

-- Exemple de cron job (à configurer dans Supabase Dashboard > Database > Cron):
-- 0 0 * * * SELECT run_daily_maintenance();

-- 6. Fonction pour obtenir les statistiques des propositions
CREATE OR REPLACE FUNCTION get_proposition_stats(p_user_id uuid, p_user_type text)
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
BEGIN
  IF p_user_type = 'producer' THEN
    SELECT jsonb_build_object(
      'total', COUNT(*),
      'pending', COUNT(*) FILTER (WHERE status = 'pending'),
      'accepted', COUNT(*) FILTER (WHERE status = 'accepted'),
      'rejected', COUNT(*) FILTER (WHERE status = 'rejected'),
      'expired', COUNT(*) FILTER (WHERE status = 'expired'),
      'total_value', COALESCE(SUM(proposed_price * quantity) FILTER (WHERE status = 'accepted'), 0)
    ) INTO stats
    FROM propositions
    WHERE producer_id = p_user_id;
  ELSE
    SELECT jsonb_build_object(
      'total', COUNT(*),
      'pending', COUNT(*) FILTER (WHERE status = 'pending'),
      'accepted', COUNT(*) FILTER (WHERE status = 'accepted'),
      'rejected', COUNT(*) FILTER (WHERE status = 'rejected'),
      'expired', COUNT(*) FILTER (WHERE status = 'expired'),
      'total_value', COALESCE(SUM(proposed_price * quantity) FILTER (WHERE status = 'accepted'), 0)
    ) INTO stats
    FROM propositions
    WHERE distributor_id = p_user_id;
  END IF;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Fonction pour obtenir les notifications non lues
CREATE OR REPLACE FUNCTION get_unread_notifications_count(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  unread_count integer;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM notifications
  WHERE user_id = p_user_id
    AND is_read = false;
  
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Vérification finale
SELECT 'Fonctions de maintenance créées avec succès' as status;
SELECT 'Configurez les cron jobs dans Supabase Dashboard' as next_step;





