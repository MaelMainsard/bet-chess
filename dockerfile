# Étape 1 : Build de l'application
FROM node:18-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json pour optimiser le cache
COPY package*.json ./

# Installer TOUTES les dépendances (incluant devDependencies)
RUN npm install

# Copier tout le code source
COPY . .

# Copie les secrets de cloud run
RUN echo "$ENV" > .env
RUN echo "$FIREBASE_CONFIG" > firebase-service-account.json

# Compiler l'application
RUN npm run build

# Étape 2 : Image finale optimisée
FROM node:18-alpine AS runner

# Définir le répertoire de travail
WORKDIR /app

# Copier uniquement les fichiers nécessaires depuis le builder
COPY --from=builder /app/package*.json ./
# Installation des dépendances de production uniquement
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/firebase-service-account.json ./firebase-service-account.json

# Définir la variable d'environnement pour NestJS
ENV NODE_ENV=production

# Lancer l'application
CMD ["node", "dist/main.js"]