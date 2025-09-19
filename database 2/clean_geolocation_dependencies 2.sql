-- Script pour nettoyer toutes les dépendances géographiques

-- 1. Lister toutes les politiques qui pourraient dépendre de coordonnées
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE qual LIKE '%coordinates%' 
   OR qual LIKE '%ST_DWithin%'
   OR qual LIKE '%geography%'
   OR qual LIKE '%point%';

-- 2. Supprimer toutes les politiques qui dépendent de coordonnées
DO $$ 
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT tablename, policyname 
    FROM pg_policies 
    WHERE qual LIKE '%coordinates%' 
       OR qual LIKE '%ST_DWithin%'
       OR qual LIKE '%geography%'
       OR qual LIKE '%point%'
  LOOP
    EXECUTE format('DROP POLICY "%s" ON %s', policy_record.policyname, policy_record.tablename);
    RAISE NOTICE 'Politique supprimée: % sur %', policy_record.policyname, policy_record.tablename;
  END LOOP;
END $$;

-- 3. Vérifier qu'il n'y a plus de politiques avec des références géographiques
SELECT 
  'Politiques restantes' as status,
  COUNT(*) as count
FROM pg_policies 
WHERE qual LIKE '%coordinates%' 
   OR qual LIKE '%ST_DWithin%'
   OR qual LIKE '%geography%'
   OR qual LIKE '%point%';

-- 4. Lister les colonnes de type point ou geography
SELECT 
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns 
WHERE data_type IN ('USER-DEFINED') 
  AND udt_name IN ('point', 'geography')
ORDER BY table_name, column_name;








