-- Vérification de l'état du Storage
-- À exécuter dans l'éditeur SQL de Supabase

-- Vérifier les buckets existants
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE name = 'product-images';

-- Vérifier les politiques RLS pour le bucket product-images
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND qual LIKE '%product-images%' OR with_check LIKE '%product-images%';

-- Vérifier s'il y a des fichiers dans le bucket
SELECT 
    id,
    name,
    bucket_id,
    owner,
    created_at,
    updated_at,
    last_accessed_at,
    metadata
FROM storage.objects
WHERE bucket_id = 'product-images'
ORDER BY created_at DESC
LIMIT 10;

-- Vérifier les permissions sur le bucket
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'objects' 
AND table_schema = 'storage';








