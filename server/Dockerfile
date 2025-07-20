FROM node:20-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn

COPY . .

# Corriger les permissions pour les environnements plus restrictifs
RUN chmod +x ./index.js

EXPOSE 3000

# Utiliser l'image officielle node pour exécuter avec des variables d'environnement
CMD ["node", "index.js"]
