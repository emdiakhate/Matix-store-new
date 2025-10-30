# 🗑️ Packages à supprimer (candidats) – Phase 2.2

Source: ANALYSE_DÉPENDANCES.md + depcheck (analysis-imports.json)

## Résumé
- Candidats initiaux: 11
- À supprimer (vérifié): 6
- À garder (utilisés/outillage): 5

## Détail par package

- @dnd-kit/core
  - Vérification: aucun import trouvé
  - Action: SUPPRIMER

- @dnd-kit/sortable
  - Vérification: aucun import trouvé
  - Action: SUPPRIMER

- @dnd-kit/utilities
  - Vérification: aucun import trouvé
  - Action: SUPPRIMER

- react-leaflet
  - Vérification: aucun import; la carte utilise `leaflet` en import dynamique dans `components/LeafletMap.tsx`
  - Action: SUPPRIMER

- leaflet
  - Vérification: utilisé (import dynamique dans `components/LeafletMap.tsx`), types référencés dans `types/leaflet.d.ts`
  - Action: GARDER

- @types/leaflet
  - Vérification: utilisé (référencé dans `types/leaflet.d.ts`)
  - Action: GARDER

- @hookform/resolvers
  - Vérification: aucun import trouvé (nous utilisons `react-hook-form` + `zod` directement)
  - Action: SUPPRIMER

- @radix-ui/react-toast
  - Vérification: aucun import trouvé (nous utilisons `sonner` pour les toasts)
  - Action: SUPPRIMER

- @next/swc-wasm-nodejs
  - Vérification: aucun import, non requis en environnement Node natif
  - Action: SUPPRIMER

- autoprefixer
  - Vérification: utilisé par `postcss.config.js`
  - Action: GARDER

- postcss
  - Vérification: utilisé par l’outillage Next/Tailwind (postcss.config.js)
  - Action: GARDER

- @types/node
  - Vérification: requis pour typings Node (TS), même si non importé dans le code
  - Action: GARDER

## Ordre de suppression proposé (du moins risqué au plus risqué)
1) @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
2) react-leaflet
3) @hookform/resolvers
4) @radix-ui/react-toast
5) @next/swc-wasm-nodejs

Chaque suppression sera suivie d’un `npm run build`. En cas d’erreur, on réinstalle et on documente la raison.
