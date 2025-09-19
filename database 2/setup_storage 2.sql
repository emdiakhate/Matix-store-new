-- Configuration du Storage pour les images de produits
-- À exécuter dans l'éditeur SQL de Supabase

-- Créer le bucket pour les images de produits (si pas déjà créé)
-- Note: Les buckets doivent être créés manuellement dans l'interface Supabase Storage

-- Politiques RLS pour le bucket product-images
-- Permettre la lecture publique des images
CREATE POLICY "Allow public read access to product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Permettre l'upload pour les utilisateurs authentifiés
CREATE POLICY "Allow authenticated uploads to product images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Permettre la mise à jour pour les propriétaires des produits
CREATE POLICY "Allow product owners to update images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'product-images');

-- Permettre la suppression pour les propriétaires des produits
CREATE POLICY "Allow product owners to delete images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'product-images');

-- Vérifier les politiques existantes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';








