# 🖼️ Documentation des balises <img> à corriger

## 📊 Statistiques
- **Total balises `<img>` trouvées** : 173
- **Recommandation** : Utiliser `next/image` pour toutes les images internes
- **Exceptions** : Images externes, SVG inline, cas spéciaux

## 📋 Plan de correction

### Priorité 1 : Images critiques (LCP)
Les images visibles au chargement doivent être converties en priorité :
- Hero sections
- Images de produits principales
- Avatars utilisateurs

### Priorité 2 : Images secondaires
- Images de galerie
- Images de catégories
- Images dans les cartes

### Priorité 3 : Images décoratives
- Icônes
- Images de fond

## 🔄 Conversion recommandée

```typescript
// Avant
<img src="/images/product.jpg" alt="Produit" />

// Après
import Image from 'next/image'
<Image src="/images/product.jpg" alt="Produit" width={500} height={300} />
```

## ⚠️ Exceptions justifiables

Pour les images externes ou SVG, désactiver la règle :
```typescript
{/* eslint-disable-next-line @next/next/no-img-element */}
<img src={externalUrl} alt="Description" />
```

## 📝 Liste des fichiers affectés

Voir `lint-report.txt` pour la liste complète des fichiers avec warnings `<img>`.

**Note** : Avec la configuration ESLint actuelle, ces warnings ne bloquent plus la compilation mais doivent être corrigés progressivement pour optimiser les performances.

