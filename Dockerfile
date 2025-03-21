# Étape de construction
FROM node:20-slim as build-stage

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Étape de production
FROM nginx:stable-alpine as production-stage

# Copier la configuration Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
