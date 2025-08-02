# Baby Check - Instructions pour Agents IA

## Architecture générale

Cette app de suivi de bébé suit une architecture client-serveur :

- **Frontend** : Vue 3 + TypeScript + Pinia (stores) + PWA avec Service Worker
- **Backend** : Express.js + MariaDB pour la persistance
- **Déploiement** : Docker avec images séparées frontend/backend

## Patterns clés du projet

### Types système événements centralisé

Les événements bébé (`BabyEvent`) sont typés strictement dans `src/types/index.ts` :

- 7 types d'événements : `pipi | caca | biberon | dodo | allaitement | medicaments | aliment`
- Propriétés conditionnelles selon le type (ex: `quantity` pour biberon, `foodReaction` pour aliment)
- Multi-enfant via `childId`

### Stores Pinia avec API intégrée

Les stores (`src/stores/`) gèrent state + appels API :

```typescript
// Pattern standard dans tous les stores
const isLoading = ref(false)
const error = ref<string | null>(null)
async function addEvent() {
  try {
    isLoading.value = true
    // Appel API puis mise à jour du state local
  } catch (err) {
    error.value = err.message
  }
}
```

### Synchronisation hors-ligne (PWA)

Service Worker + `backgroundSync.ts` pour fonctionnement offline :

- Queue localStorage pour actions hors-ligne
- Sync automatique au retour de connexion
- Cache stratifié (API: NetworkFirst, Assets: CacheFirst)

### Gestion multi-enfant

Store `child.ts` pour enfant actif + filtrage automatique des événements par `childId`

## Workflows développement

### Démarrage local

```bash
# Serveur API en watch mode
yarn server:dev

# Client Vue.js
yarn dev
```

### Tests

```bash
yarn test        # Tests unitaires Vitest
yarn test:watch  # Mode watch
```

### Base de données

```bash
cd server
yarn migrate        # Migration événements dodo
yarn migrate:foods  # Migration diversification alimentaire
```

### Docker

```bash
yarn docker:build-all   # Build frontend + backend
yarn docker-compose:up  # Démarrage complet avec DB
```

## Conventions spécifiques

### Composants Vue

- Script setup + TypeScript obligatoire
- Props typées avec interfaces dédiées
- Émits explicites avec validation

### API Routes

Pattern REST dans `server/routes/` :

- GET `/api/events/:childId` - événements par enfant
- POST `/api/events` - création événement
- PUT `/api/events/:id` - modification
- DELETE `/api/events/:id` - suppression

### Types DateTime

- Stockage DB en UTC timestamp
- Conversion client via `new Date()`
- Calculs durée sommeil automatiques (start/end → minutes)

### Visibilité événements

Store `eventVisibility` pour masquer types d'événements dans l'UI (localStorage persisté)
