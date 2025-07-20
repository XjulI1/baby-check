# baby-check

## Informations

Ce projet a été généré via `npm create vue@latest` en première instance, puis totalement via Claude 3.7 Sonnet (au travers de Github Copilot) sans toucher au code généré.

### Prompt de base

Claude 3.7 Sonnet :

```
Tu es un développeur VueJS qui maitrise sa version 3 avec les script setup.
Tu écris aussi les tests unitaires qui sont associés au code que tu écris.
Ton but est de créer une application qui permet de suivre au quotidien, plusieurs fois par jour, les évènements relatifs à la vie d'un nouveau né :
- combien de fois par jour il fait pipi et caca
- combien de millilitres de lait il boit (par biberon).
```

Par la suite, j'ai guidé Claude pour créer un serveur Express pour exposer des API (car à la base il a tout mis dans le localStorage du navigateur) et créer une image Docker pour déployer.

## Architecture

L'application est divisée en deux parties :

- Un serveur API Express.js qui gère la connexion à la base de données MariaDB
- Une application cliente Vue.js qui consomme l'API

## Fonctionnalités

L'application Baby Check dispose des fonctionnalités suivantes :

### Gestion des enfants

- Création de profils pour plusieurs enfants
- Sélection de l'enfant actif pour le suivi
- Identification par prénom et première lettre du nom de famille

### Saisie d'événements

- Suivi des événements de type pipi
- Suivi des événements de type caca
- Suivi des biberons avec quantité en millilitres
- Suivi des allaitements avec quel(s) sein(s)
- Suivi des périodes de sommeil avec durée en heures et minutes
- Ajout de notes pour chaque événement
- Horodatage automatique ou personnalisable
- Suppression d'événements

### Personnalisation de l'affichage

- **Nouvelle fonctionnalité : Masquage des types d'événements**
- Page de paramètres accessible via la navigation
- Possibilité de masquer/afficher chaque type d'événement (pipi, caca, biberon, dodo, allaitement)
- Interface avec switches pour activer/désactiver l'affichage
- Sauvegarde automatique des préférences dans le localStorage
- Les événements masqués n'apparaissent plus dans :
  - Le formulaire d'ajout d'événements
  - La liste des événements quotidiens
  - Les statistiques quotidiennes affichées
  - Les graphiques et rapports
- Bouton de réinitialisation pour remettre tous les types visibles

### Journal quotidien

- Affichage chronologique des événements du jour
- Navigation entre les différentes journées
- Affichage des statistiques quotidiennes (nombre de pipi/caca/biberons/dodo)
- Total de lait consommé par jour
- Total de temps de sommeil par jour

### Statistiques

- Visualisation des statistiques sur différentes périodes (3, 7, 15 jours)
- Calcul des moyennes quotidiennes
- Affichage des totaux sur la période sélectionnée
- Vue détaillée jour par jour
- Graphiques pour visualiser les quantités de lait sur 15 jours avec une courbe de tendance

### Technique

- Stockage des données sur serveur MariaDB
- API RESTful pour la communication client/serveur
- Interface responsive adaptée au mobile
- Support du mode sombre/clair automatique
- Installation en tant qu'application web progressive (PWA) sur iOS

### 🆕 Service Worker et Cache Intelligent (v1.1.0)

- **Service Worker intégré** pour une meilleure gestion des déploiements
- **Cache intelligent** des assets avec stratégies différenciées :
  - Images : Cache First (30 jours)
  - API : Network First (24 heures)  
  - Assets statiques : Stale While Revalidate (7 jours)
- **Mode hors ligne** complet avec synchronisation en arrière-plan
- **Mises à jour automatiques** avec notifications utilisateur
- **Gestion des versions** avec migration automatique des données
- **Indicateur de synchronisation** dans la barre de navigation
- **Paramètres avancés** pour gérer le cache et les performances
- **Détection de connexion lente** avec optimisations adaptatives

#### Fonctionnalités du Mode Hors Ligne
- Utilisation complète de l'application sans connexion internet
- Synchronisation automatique des données au retour en ligne
- Queue de synchronisation avec retry automatique
- Indicateur visuel du statut de synchronisation

#### Gestion des Mises à Jour
- Détection automatique des nouvelles versions
- Interface de notification avec notes de mise à jour
- Migration transparente des données utilisateur
- Rafraîchissement intelligent de l'application

## Screenshots

![Suivi de l'enfant](doc/Screenshot.png)
![Statistics](doc/Stats.png)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
# Installer les dépendances du client
npm install

# Installer les dépendances du serveur (optionnel, si vous utilisez un package.json séparé pour le serveur)
cd server && npm install
```

## Database Setup

```sh
# S'assurer que votre base de données MariaDB est accessible
# et que les informations de connexion sont correctes dans le fichier .env
```

## Running the Application

```sh
# Démarrer le serveur API en mode développement (watch)
npm run server:dev

# Démarrer le client Vue.js
npm run dev
```

## Docker Setup

L'application peut être exécutée avec Docker en utilisant une base de données MariaDB externe :

```sh
# Copier et modifier le fichier d'environnement avec vos informations de connexion
cp .env.docker .env
# Modifier le fichier .env avec vos informations de connexion à la base de données

# Construire les images Docker
npm run docker:build

# Démarrer les conteneurs
npm run docker:up

# Accéder à l'application
# Client: http://localhost:8080
# API: http://localhost:3000/api

# Arrêter les conteneurs
npm run docker:down
```

## Migration de la base de données

Si vous avez déjà une base de données existante et que vous souhaitez ajouter le nouveau type d'événement "dodo", exécutez la commande de migration:

```sh
# Se placer dans le dossier du serveur
cd server

# Exécuter la migration
npm run migrate
```

Cette commande mettra à jour la structure de la table `baby_events` pour supporter le nouveau type d'événement "dodo".

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
