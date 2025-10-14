# 🎯 **PLAN D'OPTIMISATION ET DE NETTOYAGE DU CODE**

## 📊 **AUDIT COMPLET DU CODEBASE**

### **🔍 PROBLÈMES IDENTIFIÉS**

#### **1. FICHIERS DUPLIQUÉS ET OBSOLÈTES**
- **Fichiers avec " 2"** : `database 2/`, `lib/supabase 2.ts`, `lib/services 2.ts`, `lib/types 2.ts`
- **Pages dupliquées** : `app/categories 2/`, `app/marques 2/`, `app/offres 2/`, `app/product 2/`
- **Fichiers de test** : `app/test-double-role/`, `app/test-role-switcher/`, `app/test-unified/`
- **Documentation obsolète** : 15+ fichiers `.md` de correction et migration

#### **2. STRUCTURE DE CODE PROBLÉMATIQUE**
- **Imports non utilisés** : Beaucoup d'imports dans les composants
- **Composants monolithiques** : `AdaptiveLayout.tsx` (400+ lignes)
- **Logique dupliquée** : Gestion des rôles dans plusieurs endroits
- **Hooks complexes** : `useProfile.ts` avec trop de responsabilités

#### **3. PERFORMANCES**
- **Bundle size** : Imports inutiles de Supabase
- **Re-renders** : Composants qui se re-rendent trop souvent
- **Images non optimisées** : Images dans `public/` sans optimisation
- **CSS non minifié** : Fichiers CSS personnalisés non optimisés

#### **4. MAINTENABILITÉ**
- **Types dispersés** : `types.ts`, `types-unified.ts`, `types 2.ts`
- **Services éparpillés** : `services.ts`, `services 2.ts`, `profileService.ts`
- **Hooks non réutilisables** : Logique métier dans les composants
- **Configuration inconsistante** : Différentes approches pour la même fonctionnalité

---

## 🚀 **PLAN D'OPTIMISATION EN 6 ÉTAPES**

### **ÉTAPE 1 : NETTOYAGE DES FICHIERS OBSOLÈTES** ⏱️ 2h
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
todo_write

