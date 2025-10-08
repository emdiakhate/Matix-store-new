# 📋 PLAN DE MIGRATION - SYSTÈME UNIFIÉ

## 🎯 **OBJECTIF**
Migrer toutes les pages existantes qui utilisent `ProducerLayout` et `DistributorLayout` vers le nouveau système unifié avec `AdaptiveLayout`.

## 📊 **ANALYSE DES PAGES EXISTANTES**

### **🌾 Pages Producteur (utilisant ProducerLayout) :**
- `app/dashboard/page.tsx` - Dashboard principal
- `app/dashboard/products/page.tsx` - Gestion des produits
- `app/dashboard/products/[id]/page.tsx` - Détail produit
- `app/dashboard/geolocation/page.tsx` - Géolocalisation
- `app/dashboard/reviews/page.tsx` - Avis
- `app/dashboard/received-offers/page.tsx` - Offres reçues
- `app/dashboard/announcements/page.tsx` - Annonces
- `app/dashboard/sent-propositions/page.tsx` - Propositions envoyées
- `app/dashboard/opportunities/page.tsx` - Opportunités
- `app/dashboard/stats/page.tsx` - Statistiques
- `app/dashboard/profile/page.tsx` - Profil
- `app/dashboard/orders/page.tsx` - Commandes

### **🏪 Pages Distributeur (utilisant DistributorLayout) :**
- `app/dashboard/distributor/page.tsx` - Dashboard distributeur
- `app/dashboard/distributor/search/page.tsx` - Recherche producteurs
- `app/dashboard/distributor/requests/page.tsx` - Annonces
- `app/dashboard/distributor/propositions/page.tsx` - Propositions
- `app/dashboard/distributor/achats/page.tsx` - Achats
- `app/dashboard/distributor/alerts/page.tsx` - Alertes
- `app/dashboard/distributor/my-reviews/page.tsx` - Avis
- `app/dashboard/distributor/profile/page.tsx` - Profil

## 🚀 **STRATÉGIE DE MIGRATION**

### **ÉTAPE 1 : Migration des pages Producteur**
1. **Dashboard principal** (`/dashboard/page.tsx`)
2. **Pages de gestion** (produits, géolocalisation, etc.)
3. **Pages de statistiques** (stats, orders, etc.)

### **ÉTAPE 2 : Migration des pages Distributeur**
1. **Dashboard distributeur** (`/dashboard/distributor/page.tsx`)
2. **Pages de recherche** (search, requests, etc.)
3. **Pages de gestion** (propositions, achats, etc.)

### **ÉTAPE 3 : Tests et validation**
1. **Tests de navigation** entre les rôles
2. **Tests de fonctionnalités** spécifiques
3. **Tests de responsive** design

## 🔧 **MODIFICATIONS REQUISES**

### **Pour chaque page :**
1. **Remplacer** `ProducerLayout` ou `DistributorLayout` par `AdaptiveLayout`
2. **Supprimer** les imports des anciens layouts
3. **Adapter** les props si nécessaire
4. **Tester** la navigation et les fonctionnalités

### **Avantages de la migration :**
- ✅ **Interface unifiée** : Même design pour tous les rôles
- ✅ **Switch de rôle** : Possibilité de changer de rôle
- ✅ **Navigation adaptative** : Menu qui s'adapte au rôle
- ✅ **Maintenance simplifiée** : Un seul layout à maintenir
- ✅ **Cohérence** : Design uniforme dans toute l'application

## 📝 **CHECKLIST DE MIGRATION**

### **Pour chaque page :**
- [ ] Remplacer l'import du layout
- [ ] Adapter les props du layout
- [ ] Tester la navigation
- [ ] Vérifier le responsive design
- [ ] Valider les fonctionnalités spécifiques

### **Tests globaux :**
- [ ] Navigation entre les rôles
- [ ] Switch de rôle fonctionnel
- [ ] Interface adaptative
- [ ] Permissions spécifiques
- [ ] Performance et stabilité

## 🎯 **RÉSULTAT ATTENDU**

Après la migration, toutes les pages utiliseront le système unifié avec :
- **AdaptiveLayout** pour tous les rôles
- **RoleSwitcher** intégré
- **Navigation adaptative** selon le rôle
- **Interface cohérente** et moderne
- **Fonctionnalités préservées** et améliorées
