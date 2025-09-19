-- Script pour nettoyer les doublons dans la table brands

-- 1. Vérifier les doublons existants
SELECT 
  distributor_id,
  COUNT(*) as duplicate_count,
  array_agg(id) as brand_ids,
  array_agg(created_at) as created_dates
FROM brands 
GROUP BY distributor_id 
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 2. Supprimer les doublons en gardant seulement le plus récent
WITH duplicates AS (
  SELECT 
    id,
    distributor_id,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY distributor_id 
      ORDER BY created_at DESC
    ) as rn
  FROM brands
)
DELETE FROM brands 
WHERE id IN (
  SELECT id 
  FROM duplicates 
  WHERE rn > 1
);

-- 3. Vérifier qu'il n'y a plus de doublons
SELECT 
  distributor_id,
  COUNT(*) as count
FROM brands 
GROUP BY distributor_id 
HAVING COUNT(*) > 1;

-- 4. Afficher le contenu final de la table brands
SELECT 
  id,
  distributor_id,
  name,
  created_at,
  updated_at
FROM brands 
ORDER BY distributor_id, created_at;








