-- Ajouter des produits pour les 3 producteurs existants
-- Producteur 1: b9e68c20-60df-40d9-9a35-1df76838bc29
INSERT INTO products (id, name, description, price, stock_quantity, unit_type, user_id, category_id, images) VALUES
  (gen_random_uuid(), 'Poulets de chair', 'Poulets de chair de qualité premium, élevés en plein air', 5000, 150, 'piece', 'b9e68c20-60df-40d9-9a35-1df76838bc29', '1', '["https://images.pexels.com/photos/2679501/pexels-photo-2679501.jpeg?auto=compress&cs=tinysrgb&w=400"]'),
  (gen_random_uuid(), 'Poulets pondeuses', 'Poulets pondeuses productives, idéales pour la production d''œufs', 4500, 80, 'piece', 'b9e68c20-60df-40d9-9a35-1df76838bc29', '1', '["https://images.pexels.com/photos/2679501/pexels-photo-2679501.jpeg?auto=compress&cs=tinysrgb&w=400"]'),
  (gen_random_uuid(), 'Poussins d''un jour', 'Poussins d''un jour en excellente santé, vaccinés', 800, 200, 'piece', 'b9e68c20-60df-40d9-9a35-1df76838bc29', '2', '["https://images.pexels.com/photos/2679501/pexels-photo-2679501.jpeg?auto=compress&cs=tinysrgb&w=400"]'),
  (gen_random_uuid(), 'Œufs frais', 'Œufs frais du jour, de poules élevées en plein air', 150, 500, 'piece', 'b9e68c20-60df-40d9-9a35-1df76838bc29', '3', '["https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=400"]'),
  (gen_random_uuid(), 'Mangeoires automatiques', 'Mangeoires automatiques pour volailles, capacité 20kg', 25000, 15, 'piece', 'b9e68c20-60df-40d9-9a35-1df76838bc29', '4', '["https://images.pexels.com/photos/2679501/pexels-photo-2679501.jpeg?auto=compress&cs=tinysrgb&w=400"]');

-- Producteur 2: 267060b0-13d5-4fa9-a414-dbc1e533f05b
INSERT INTO products (id, name, description, price, stock_quantity, unit_type, user_id, category_id, images) VALUES
  (gen_random_uuid(), 'Canards de Barbarie', 'Canards de Barbarie élevés en liberté, viande savoureuse', 8000, 60, 'piece', '267060b0-13d5-4fa9-a414-dbc1e533f05b', '1', '["https://images.pexels.com/photos/2679501/pexels-photo-2679501.jpeg?auto=compress&cs=tinysrgb&w=400"]'),
  (gen_random_uuid(), 'Oies grasses', 'Oies grasses pour foie gras, élevage traditionnel', 15000, 30, 'piece', '267060b0-13d5-4fa9-a414-dbc1e533f05b', '1', '["https://images.pexels.com/photos/2679501/pexels-photo-2679501.jpeg?auto=compress&cs=tinysrgb&w=400"]'),
  (gen_random_uuid(), 'Dindes', 'Dindes de Noël, élevées en plein air', 12000, 25, 'piece', '267060b0-13d5-4fa9-a414-dbc1e533f05b', '1', '["https://images.pexels.com/photos/2679501/pexels-photo-2679501.jpeg?auto=compress&cs=tinysrgb&w=400"]'),
  (gen_random_uuid(), 'Aliments pour volailles', 'Aliments composés de qualité pour volailles', 500, 1000, 'kg', '267060b0-13d5-4fa9-a414-dbc1e533f05b', '5', '["https://images.pexels.com/photos/2679501/pexels-photo-2679501.jpeg?auto=compress&cs=tinysrgb&w=400"]'),
  (gen_random_uuid(), 'Vaccins avicoles', 'Vaccins pour volailles, gamme complète', 2000, 50, 'boite', '267060b0-13d5-4fa9-a414-dbc1e533f05b', '6', '["https://images.pexels.com/photos/2679501/pexels-photo-2679501.jpeg?auto=compress&cs=tinysrgb&w=400"]');

-- Producteur 3: 4c903b38-5346-4d43-bc99-40691ae45145
INSERT INTO products (id, name, description, price, stock_quantity, unit_type, user_id, category_id, images) VALUES
  (gen_random_uuid(), 'Pintades', 'Pintades élevées en liberté, viande délicate', 6000, 40, 'piece', '4c903b38-5346-4d43-bc99-40691ae45145', '1', '["https://images.pexels.com/photos/2679501/pexels-photo-2679501.jpeg?auto=compress&cs=tinysrgb&w=400"]'),
  (gen_random_uuid(), 'Cailles', 'Cailles d''élevage, œufs et viande', 3000, 100, 'piece', '4c903b38-5346-4d43-bc99-40691ae45145', '1', '["https://images.pexels.com/photos/2679501/pexels-photo-2679501.jpeg?auto=compress&cs=tinysrgb&w=400"]'),
  (gen_random_uuid(), 'Œufs de caille', 'Œufs de caille frais, riches en protéines', 50, 800, 'piece', '4c903b38-5346-4d43-bc99-40691ae45145', '3', '["https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=400"]'),
  (gen_random_uuid(), 'Cages d''élevage', 'Cages d''élevage pour volailles, dimensions variables', 15000, 20, 'piece', '4c903b38-5346-4d43-bc99-40691ae45145', '4', '["https://images.pexels.com/photos/2679501/pexels-photo-2679501.jpeg?auto=compress&cs=tinysrgb&w=400"]'),
  (gen_random_uuid(), 'Système d''abreuvement', 'Système d''abreuvement automatique pour volailles', 18000, 12, 'piece', '4c903b38-5346-4d43-bc99-40691ae45145', '4', '["https://images.pexels.com/photos/2679501/pexels-photo-2679501.jpeg?auto=compress&cs=tinysrgb&w=400"]');

-- Mettre à jour les noms des producteurs
UPDATE users 
SET business_name = 'Ferme Avicole de Dakar'
WHERE id = 'b9e68c20-60df-40d9-9a35-1df76838bc29';

UPDATE users 
SET business_name = 'Élevage Traditionnel du Sénégal'
WHERE id = '267060b0-13d5-4fa9-a414-dbc1e533f05b';

UPDATE users 
SET business_name = 'Volaille Premium de Thiès'
WHERE id = '4c903b38-5346-4d43-bc99-40691ae45145';

-- Marquer tous les producteurs comme vérifiés
UPDATE users 
SET is_verified = true 
WHERE user_type = 'producer';

-- Vérifier le résultat
SELECT 
  u.id,
  u.business_name,
  u.is_verified,
  COUNT(p.id) as product_count
FROM users u
LEFT JOIN products p ON u.id = p.user_id
WHERE u.user_type = 'producer'
GROUP BY u.id, u.business_name, u.is_verified;







