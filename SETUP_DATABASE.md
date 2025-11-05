# Configuration de la Base de Données Supabase

## Étapes à Suivre

### 1. Créer les Tables Orders et Payments

Allez dans votre projet Supabase :

1. Ouvrez https://supabase.com/dashboard
2. Sélectionnez votre projet `Matix Store`
3. Cliquez sur **SQL Editor** dans le menu de gauche
4. Cliquez sur **New Query**
5. Copiez-collez le contenu du fichier `supabase/migrations/create_orders_and_payments_tables.sql`
6. Cliquez sur **Run** pour exécuter la migration

Cela va créer :

- ✅ Table `orders` pour stocker les commandes
- ✅ Table `payments` pour stocker les transactions Bictorys
- ✅ Index pour optimiser les requêtes
- ✅ Triggers pour mettre à jour automatiquement les timestamps
- ✅ Politiques RLS temporaires pour le développement

### 2. Vérifier les Tables

Après avoir exécuté le SQL, vérifiez que les tables sont créées :

1. Allez dans **Table Editor**
2. Vous devriez voir les tables `orders` et `payments`

### 3. Problème d'Authentification (Erreur 500)

Si vous obtenez une erreur 500 lors de la création de compte, c'est probablement parce que :

- ⚠️ Le trigger `handle_new_user_signup()` n'existe pas
- ⚠️ La table `users` n'existe pas ou n'a pas la bonne structure

**Solution** : Créez le trigger suivant dans SQL Editor :

```sql
-- Créer la table users si elle n'existe pas
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  nom VARCHAR(255),
  prenom VARCHAR(255),
  telephone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fonction pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nom, prenom, telephone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'nom',
    NEW.raw_user_meta_data->>'prenom',
    NEW.raw_user_meta_data->>'telephone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger qui s'exécute après chaque inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_signup();
```

### 4. Tester l'Authentification

Après avoir créé le trigger :

1. Allez sur http://localhost:3001
2. Essayez de créer un nouveau compte
3. L'erreur 500 devrait disparaître

### 5. Vérifier les Données

Pour vérifier que tout fonctionne :

```sql
-- Voir tous les utilisateurs
SELECT * FROM users;

-- Voir toutes les commandes
SELECT * FROM orders;

-- Voir tous les paiements
SELECT * FROM payments;
```

## Problèmes Courants

### Erreur: "relation users does not exist"

➡️ Créez la table `users` avec le SQL ci-dessus

### Erreur: "function handle_new_user_signup() does not exist"

➡️ Créez la fonction et le trigger avec le SQL ci-dessus

### Erreur: "permission denied for table"

➡️ Vérifiez que RLS est activé et que les politiques sont créées

## Prochaines Étapes

Une fois la base de données configurée :

1. ✅ Créer 2 comptes de test
2. ✅ Ajouter 10 produits pour chaque compte
3. ✅ Tester le flux de paiement complet avec Bictorys
4. ✅ Phase 2 : Sécuriser avec RLS approprié
