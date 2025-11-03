# 📋 Instructions - Migration SQL 003 : Utilisation de la table 'users'

**Date** : 2025-01-30  
**Migration** : `003_use_users_table.sql`

---

## 🎯 Objectif

Cette migration configure la table `users` existante pour remplacer la table `profiles` dans le système d'authentification, avec support du système multi-rôles.

---

## ✅ Avant de commencer

1. **Vérifier que vous êtes dans Supabase Dashboard**
   - Projet Supabase ouvert
   - Accès à l'éditeur SQL

2. **Backup recommandé** (optionnel mais recommandé)
   ```sql
   -- Créer une copie de la table users (si données existantes)
   CREATE TABLE users_backup AS SELECT * FROM users;
   ```

---

## 📝 Étapes d'Exécution

### Étape 1 : Ouvrir l'éditeur SQL

1. Dans Supabase Dashboard
2. Menu gauche → **SQL Editor**
3. Cliquer sur **New Query**

### Étape 2 : Copier le contenu de la migration

1. Ouvrir le fichier `supabase/migrations/003_use_users_table.sql`
2. Copier **tout le contenu**

### Étape 3 : Exécuter la migration

1. Coller le contenu dans l'éditeur SQL de Supabase
2. Cliquer sur **Run** (ou `Cmd/Ctrl + Enter`)
3. Vérifier qu'il n'y a **pas d'erreurs** dans les logs

### Étape 4 : Vérifier le résultat

Exécuter cette requête pour vérifier :

```sql
-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('email', 'full_name', 'phone', 'roles', 'active_role', 'avatar_url', 'email_confirmed');

-- Vérifier que le trigger existe
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Vérifier les index
SELECT indexname
FROM pg_indexes
WHERE tablename = 'users'
AND indexname LIKE 'idx_users%';
```

**Résultat attendu** :

- ✅ 7 colonnes listées
- ✅ Trigger `on_auth_user_created` présent
- ✅ Index `idx_users_active_role`, `idx_users_email`, `idx_users_roles` présents

---

## 🔍 Test de la Migration

### Test 1 : Vérifier la structure de la table

```sql
SELECT * FROM users LIMIT 1;
```

**Attendu** : Colonnes `roles`, `active_role`, `email`, `full_name`, `phone` présentes

### Test 2 : Vérifier le trigger (inscription test)

⚠️ **Ne pas exécuter en production avec de vraies données**

Le trigger sera testé automatiquement lors de la prochaine inscription via l'application.

### Test 3 : Vérifier les politiques RLS

```sql
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'users';
```

**Attendu** : Au moins 3 politiques (SELECT, UPDATE, INSERT)

---

## ⚠️ Points d'Attention

### 1. Données existantes

Si des utilisateurs existent déjà dans `users` mais sans les nouvelles colonnes :

- Les colonnes seront créées avec des valeurs `NULL` par défaut
- Les utilisateurs existants devront mettre à jour leur profil

### 2. Table `profiles`

⚠️ **Ne pas supprimer** la table `profiles` immédiatement :

- Elle peut être utilisée par des processus en cours
- À supprimer après validation complète de la migration

### 3. Rôles par défaut

Tous les nouveaux utilisateurs auront :

- `roles` : `['farmer', 'distributor']`
- `active_role` : `'farmer'`

---

## 🔄 Rollback (si nécessaire)

Si la migration cause des problèmes, voici comment revenir en arrière :

```sql
-- 1. Supprimer le nouveau trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Recréer l'ancien trigger (si vous avez le script 001_initial_schema.sql)
-- (Copier le trigger depuis 001_initial_schema.sql)

-- 3. Optionnel : Supprimer les colonnes ajoutées (si pas de données)
ALTER TABLE users DROP COLUMN IF EXISTS email;
ALTER TABLE users DROP COLUMN IF EXISTS full_name;
ALTER TABLE users DROP COLUMN IF EXISTS phone;
ALTER TABLE users DROP COLUMN IF EXISTS roles;
ALTER TABLE users DROP COLUMN IF EXISTS active_role;
ALTER TABLE users DROP COLUMN IF EXISTS avatar_url;
ALTER TABLE users DROP COLUMN IF EXISTS email_confirmed;
```

---

## ✅ Checklist Post-Migration

- [ ] Migration exécutée sans erreurs
- [ ] Colonnes `roles` et `active_role` présentes dans `users`
- [ ] Trigger `on_auth_user_created` créé
- [ ] Index créés
- [ ] Politiques RLS vérifiées
- [ ] Test d'inscription réussi (création automatique dans `users`)
- [ ] Code applicatif mis à jour (authService, useAuth, etc.)

---

## 📞 Support

En cas de problème :

1. Vérifier les logs SQL dans Supabase Dashboard
2. Vérifier que les permissions RLS sont correctes
3. Vérifier que le trigger s'exécute (logs Supabase)

---

**Migration créée le** : 2025-01-30  
**Version** : 1.0
