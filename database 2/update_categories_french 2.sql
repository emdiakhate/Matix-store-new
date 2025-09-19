-- Mise à jour des catégories avec les noms en français
-- À exécuter dans l'éditeur SQL de Supabase

-- Mettre à jour les catégories existantes avec les noms en français
UPDATE public.categories 
SET 
  name_fr = 'Volaille',
  description_fr = 'Produits avicoles incluant poulets, œufs et alimentation'
WHERE name = 'Poultry';

UPDATE public.categories 
SET 
  name_fr = 'Poulets',
  description_fr = 'Poulets vivants et viande de poulet'
WHERE name = 'Chickens';

UPDATE public.categories 
SET 
  name_fr = 'Œufs',
  description_fr = 'Œufs frais de volaille'
WHERE name = 'Eggs';

UPDATE public.categories 
SET 
  name_fr = 'Poussins',
  description_fr = 'Poussins d''un jour et jeunes poulets'
WHERE name = 'Chicks';

-- Ajouter de nouvelles catégories en français si elles n'existent pas
INSERT INTO public.categories (id, name, name_fr, description, description_fr)
VALUES 
    (gen_random_uuid(), 'Equipment', 'Équipements', 'Poultry farming equipment and tools', 'Équipements et outils d''élevage avicole'),
    (gen_random_uuid(), 'Feed', 'Alimentation', 'Animal feed and supplements', 'Aliments pour animaux et compléments'),
    (gen_random_uuid(), 'Medicine', 'Médicaments', 'Veterinary medicines and vaccines', 'Médicaments vétérinaires et vaccins'),
    (gen_random_uuid(), 'Services', 'Services', 'Veterinary and farming services', 'Services vétérinaires et d''élevage')
ON CONFLICT DO NOTHING;

-- Afficher toutes les catégories mises à jour
SELECT id, name, name_fr, description, description_fr FROM public.categories ORDER BY name;








