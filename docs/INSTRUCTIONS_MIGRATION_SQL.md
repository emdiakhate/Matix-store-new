# 📋 Instructions pour Exécuter la Migration SQL Supabase

## ⏱️ Temps estimé : 5 minutes

## 🎯 Objectif
Créer la table `profiles` et activer Row Level Security (RLS) dans votre base de données Supabase.

---

## 📝 Étapes à suivre

### Étape 1 : Se connecter à Supabase (1 min)

1. Ouvrir votre navigateur
2. Aller sur **https://supabase.com/dashboard**
3. Se connecter avec votre compte
4. Sélectionner votre projet **Matix Store**

### Étape 2 : Ouvrir l'éditeur SQL (30 sec)

1. Dans le menu latéral gauche, cliquer sur **"SQL Editor"** (icône `</>`)
2. Cliquer sur le bouton **"New Query"** en haut à droite

### Étape 3 : Copier le code SQL (1 min)

1. Ouvrir le fichier `supabase/migrations/001_initial_schema.sql` dans votre éditeur
2. Sélectionner **TOUT le contenu** du fichier (`Ctrl+A` / `Cmd+A`)
3. Copier (`Ctrl+C` / `Cmd+C`)

### Étape 4 : Coller et exécuter (1 min)

1. Revenir sur le dashboard Supabase
2. Coller le code dans l'éditeur SQL (`Ctrl+V` / `Cmd+V`)
3. Cliquer sur le bouton **"Run"** (ou `Ctrl+Enter` / `Cmd+Enter`)
4. Attendre quelques secondes

### Étape 5 : Vérifier le succès (1 min)

Vous devriez voir un message de succès :
```
✓ Success. No rows returned
```

Si vous voyez des messages comme :
- `CREATE TYPE` - ✅ Parfait
- `CREATE TABLE` - ✅ Parfait
- `ALTER TABLE` - ✅ Parfait
- `CREATE POLICY` - ✅ Parfait
- `CREATE FUNCTION` - ✅ Parfait
- `CREATE TRIGGER` - ✅ Parfait

### Étape 6 : Vérifier la table créée (30 sec)

1. Dans le menu latéral, cliquer sur **"Table Editor"**
2. Vous devriez voir la table **"profiles"** dans la liste
3. Cliquer dessus pour voir sa structure
4. Vérifier qu'il y a une icône de **cadenas 🔒** à côté du nom (= RLS activé)

---

## ✅ Validation finale

Cochez ces points pour confirmer que tout est OK :

- [ ] La requête SQL s'est exécutée sans erreur
- [ ] La table "profiles" apparaît dans Table Editor
- [ ] L'icône de cadenas 🔒 est visible (RLS activé)
- [ ] Les colonnes suivantes sont présentes : `id`, `email`, `nom`, `prenom`, `telephone`, `role`, `avatar_url`, `created_at`, `updated_at`
- [ ] Le type `user_role` est créé avec les valeurs : `eleveur`, `acheteur`, `admin`

---

## ⚠️ En cas de problème

### Erreur : "relation profiles already exists"
**C'est normal !** La table existe déjà. Vous pouvez :
- Soit ignorer cette erreur
- Soit exécuter uniquement les parties `ALTER TABLE` et `CREATE POLICY`

### Erreur : "type user_role already exists"
**C'est normal !** Le type existe déjà. Vous pouvez ignorer cette erreur.

### Erreur : "permission denied"
Vérifiez que vous êtes bien connecté avec le compte propriétaire du projet.

### Erreur : "function handle_new_user already exists"
**C'est normal !** La fonction existe déjà. Vous pouvez ignorer cette erreur.

### Autre erreur
1. Copier le message d'erreur complet
2. Le partager avec votre développeur
3. Ne pas paniquer, c'est souvent facile à corriger !

---

## 🔍 Vérification automatique

Après avoir exécuté la migration, vous pouvez vérifier que tout fonctionne :

```bash
npm run verify-supabase
```

Ce script va automatiquement :
- ✅ Vérifier la connexion à Supabase
- ✅ Vérifier que la table `profiles` existe
- ✅ Vérifier la structure de la table
- ✅ Vérifier que RLS est actif

---

## 📊 Ce que fait cette migration

### 1. Crée le type `user_role`
```sql
CREATE TYPE user_role AS ENUM ('eleveur', 'acheteur', 'admin');
```

### 2. Crée la table `profiles`
```sql
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    telephone TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'acheteur',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Active Row Level Security
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### 4. Crée les policies de sécurité
- Les utilisateurs peuvent lire leur propre profil
- Les utilisateurs peuvent mettre à jour leur propre profil
- Les utilisateurs peuvent insérer leur propre profil
- Les profils publics sont visibles par tous (nom, prénom, rôle uniquement)

### 5. Crée les triggers automatiques
- Création automatique d'un profil lors de l'inscription
- Mise à jour automatique de `updated_at`
- Suppression automatique du profil lors de la suppression de l'utilisateur

### 6. Crée les index pour les performances
- Index sur `email`
- Index sur `role`
- Index sur `telephone`

---

## 🎉 Bravo !

Votre base de données est maintenant configurée avec :
- ✅ Table `profiles` créée
- ✅ Row Level Security activé
- ✅ Policies de sécurité en place
- ✅ Triggers de création automatique de profil
- ✅ Index pour les performances
- ✅ Documentation complète

Vous pouvez maintenant tester l'inscription d'un nouvel utilisateur !

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez la section "En cas de problème" ci-dessus
2. Exécutez `npm run verify-supabase` pour diagnostiquer
3. Partagez le message d'erreur complet avec votre développeur

**Bon courage ! 🚀**
