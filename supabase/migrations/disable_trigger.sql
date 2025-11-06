-- Désactiver temporairement le trigger qui cause problème

DROP TRIGGER IF EXISTS trigger_check_alerts_on_product_insert ON products;
DROP TRIGGER IF EXISTS check_product_alerts ON products;

-- Vous pouvez maintenant exécuter seed_data_final.sql sans erreur
