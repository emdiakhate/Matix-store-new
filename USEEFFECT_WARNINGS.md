# ⚠️ Documentation des warnings useEffect exhaustive-deps

## 📊 Statistiques
- **Total warnings** : ~10
- **Règle** : `react-hooks/exhaustive-deps`
- **Statut** : Warnings (non-bloquants)

## 🔍 Types de warnings

### 1. Dépendances manquantes (vraies)
```typescript
// Avant
useEffect(() => {
  fetchData(userId)
}, []) // ❌ userId manquant

// Après
useEffect(() => {
  fetchData(userId)
}, [userId]) // ✅
```

### 2. Fonctions stables (faux positifs)
```typescript
// Solution : useCallback
const fetchData = useCallback(() => {
  // ...
}, [dependencies])

useEffect(() => {
  fetchData()
}, [fetchData]) // ✅
```

### 3. Dépendances intentionnellement omises
```typescript
// Solution : eslint-disable avec commentaire
useEffect(() => {
  initializeOnce() // Montage unique
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])
```

## 📝 Fichiers affectés

1. `app/dashboard/distributor/propositions/page.tsx` - fetchPropositions
2. `components/ChatBot-new.tsx` - handlePlayAudio, addAudioMessage
3. `components/ChatBot-old.tsx` - addAudioMessage, chatFlow.welcome
4. `components/ChatBot.tsx` - handlePlayAudio, allFlows
5. `components/RoleSwitcher.tsx` - user
6. `app/dashboard/products/[id]/page.tsx` - mockProducts, mockReviews

## ✅ Action recommandée

Corriger progressivement en fonction de la criticité :
- **Critique** : Dépendances manquantes qui causent des bugs
- **Important** : Fonctions instables qui causent des re-renders
- **Optionnel** : Faux positifs documentés avec eslint-disable

**Note** : Avec la configuration ESLint actuelle, ces warnings ne bloquent plus la compilation mais doivent être corrigés progressivement pour éviter les bugs.

