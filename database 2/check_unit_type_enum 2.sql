-- Vérifier les valeurs valides de l'enum unit_type
SELECT 
  enumlabel as valid_unit_type
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid 
  FROM pg_type 
  WHERE typname = 'unit_type'
)
ORDER BY enumsortorder;

-- Vérifier aussi la structure de la colonne unit_type
SELECT 
  column_name,
  data_type,
  udt_name,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name = 'unit_type';






