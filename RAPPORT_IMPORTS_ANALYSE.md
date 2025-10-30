# 📊 Rapport Analyse des Imports – Phase 2.2

## Dépendances non utilisées (depcheck)
Fichier: `analysis-imports.json`

- Unused dependencies (11):
  - @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
  - react-leaflet
  - @hookform/resolvers
  - @radix-ui/react-toast
  - @next/swc-wasm-nodejs
  - autoprefixer, postcss
  - @types/node

- Missing: @jest/globals (référencé dans tests/security/routes.test.ts)

## Vérifications d’usage (grep)
- dnd-kit (3): aucun import trouvé → candidats suppression
- react-leaflet: aucun import (la carte utilise `leaflet` directement) → candidat suppression
- leaflet: utilisé (LeafletMap.tsx import dynamique)
- @types/leaflet: utilisé (types/leaflet.d.ts)
- @hookform/resolvers: aucun import → candidat suppression
- @radix-ui/react-toast: aucun import → candidat suppression
- @next/swc-wasm-nodejs: aucun import → candidat suppression
- autoprefixer: utilisé via postcss.config.js → garder
- postcss: utilisé via outillage Next/Tailwind → garder
- @types/node: requis pour TS → garder

## Lint auto-fix
Commande: `npm run lint -- --fix`

- Résultat: erreurs restantes (voir `LINT_OUTPUT.txt`)
- Principaux constats:
  - Règle react/no-unescaped-entities sur plusieurs pages
  - Avertissements @next/next/no-img-element (préférer `<Image />`)

## Top fichiers avec avertissements/erreurs (échantillon)
- app/annonces/page.tsx – erreurs d’entités + <img>
- app/categories/page.tsx – erreurs d’entités + <img>
- app/checkout/page.tsx – erreurs d’entités + <img>
- app/dashboard/account/page.tsx – erreurs d’entités + <img>

(NB: Le lint ne liste pas ici les imports inutilisés par fichier; ce sera traité par corrections ciblées au fil du nettoyage.)

## Estimation du temps de nettoyage
- Suppression packages (6): 20–30 min (avec builds)
- Corrections lint ciblées: 45–60 min
- Optimisations imports (`* as` → imports nommés): 30–45 min
