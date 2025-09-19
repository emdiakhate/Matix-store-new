# Configuration Supabase pour MATIX Store

## 🚀 Installation et Configuration

### 1. Variables d'Environnement

Le fichier `.env.local` a été créé avec les clés Supabase suivantes :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://nwxmedwoykcptzpkvphe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Initialisation de la Base de Données

1. Connectez-vous à votre projet Supabase
2. Allez dans l'éditeur SQL
3. Copiez et exécutez le contenu du fichier `database/schema.sql`

### 3. Dépendances Installées

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## 📁 Structure des Fichiers

### Configuration
- `lib/supabase.ts` - Configuration du client Supabase
- `lib/types.ts` - Types TypeScript pour la base de données
- `lib/services.ts` - Services pour interagir avec Supabase

### Hooks
- `hooks/useSupabase.ts` - Hooks personnalisés pour l'authentification

### Composants
- `components/AuthModal.tsx` - Modal d'authentification mis à jour

## 🔐 Authentification

### Hooks Disponibles

```typescript
import { useAuth, useUser, useSession } from '@/hooks/useSupabase'

// Hook d'authentification complet
const { user, loading, signUp, signIn, signOut, resetPassword } = useAuth()

// Hook pour l'utilisateur
const { user, loading } = useUser()

// Hook pour la session
const { session, loading } = useSession()
```

### Exemple d'Utilisation

```typescript
import { useAuth } from '@/hooks/useSupabase'

function LoginComponent() {
  const { signIn, user } = useAuth()

  const handleLogin = async () => {
    const { data, error } = await signIn('email@example.com', 'password')
    if (error) {
      console.error('Erreur de connexion:', error)
    } else {
      console.log('Utilisateur connecté:', data.user)
    }
  }

  return (
    <button onClick={handleLogin}>
      Se connecter
    </button>
  )
}
```

## 🗄️ Services de Base de Données

### Services Disponibles

```typescript
import { 
  userService, 
  productService, 
  deliveryRequestService, 
  quoteService, 
  orderService, 
  categoryService 
} from '@/lib/services'
```

### Exemples d'Utilisation

#### Utilisateurs
```typescript
// Créer un profil utilisateur
const { data, error } = await userService.createProfile(userId, {
  user_type: 'producer',
  business_name: 'Ma Ferme',
  is_verified: false
})

// Obtenir le profil
const { data: profile } = await userService.getProfile(userId)
```

#### Produits
```typescript
// Créer un produit
const { data, error } = await productService.createProduct({
  producer_id: userId,
  title: 'Poulets de chair',
  description: 'Poulets frais de qualité',
  price: 5000,
  stock_quantity: 100,
  unit_type: 'piece',
  is_organic: true
})

// Rechercher des produits à proximité
const { data: nearbyProducts } = await productService.searchProductsNearby(
  14.7167, -17.4677, // Coordonnées Dakar
  50 // Rayon en km
)
```

#### Demandes de Livraison
```typescript
// Créer une demande
const { data, error } = await deliveryRequestService.createRequest({
  client_id: userId,
  product_description: 'Poulets frais',
  quantity: 10,
  budget_range: { min: 40000, max: 60000 },
  delivery_address: 'Dakar, Sénégal'
})
```

## 🗺️ Géolocalisation

### Fonctions Disponibles

Le schéma inclut des fonctions PostgreSQL pour la géolocalisation :

- `calculate_distance(lat1, lng1, lat2, lng2)` - Calcule la distance entre deux points
- `search_products_nearby(lat, lng, radius)` - Recherche des produits à proximité
- `get_requests_in_zone(lat, lng, radius)` - Obtient les demandes dans une zone

### Exemple d'Utilisation

```typescript
// Rechercher des produits dans un rayon de 50km
const { data } = await supabase.rpc('search_products_nearby', {
  search_lat: 14.7167,
  search_lng: -17.4677,
  search_radius: 50
})
```

## 🔒 Sécurité (RLS)

### Politiques Configurées

- **Utilisateurs** : Chaque utilisateur ne peut voir/modifier que son propre profil
- **Produits** : Lecture publique, modification uniquement par le producteur
- **Demandes de livraison** : Clients voient leurs demandes, distributeurs voient celles dans leur zone
- **Devis** : Distributeurs voient leurs devis, clients voient les devis pour leurs demandes
- **Commandes** : Vendeurs et acheteurs voient leurs commandes respectives

## 🌐 API Routes (Optionnel)

Pour des opérations plus complexes, vous pouvez créer des API routes Next.js :

```typescript
// app/api/products/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
  
  return Response.json({ data, error })
}
```

## 🚀 Prochaines Étapes

1. **Exécuter le schéma SQL** dans Supabase
2. **Tester l'authentification** avec le composant AuthModal
3. **Créer des données de test** pour les catégories et produits
4. **Implémenter les fonctionnalités** spécifiques (paiements, notifications, etc.)
5. **Configurer les webhooks** pour les événements en temps réel

## 📝 Notes Importantes

- Les clés Supabase sont déjà configurées dans `.env.local`
- Le schéma inclut PostGIS pour la géolocalisation
- Les politiques RLS sont configurées pour la sécurité
- Les types TypeScript sont générés pour la sécurité des types
- L'authentification utilise les hooks personnalisés pour une meilleure UX

## 🔧 Dépannage

### Erreurs Courantes

1. **"Invalid API key"** : Vérifiez les variables d'environnement
2. **"RLS policy violation"** : Vérifiez que l'utilisateur est authentifié
3. **"Function not found"** : Exécutez le schéma SQL complet

### Support

Pour toute question ou problème, consultez :
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Next.js](https://nextjs.org/docs)
- Les logs de la console pour les erreurs détaillées
