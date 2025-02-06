# Étape 1 : Build de l'application
FROM node:18-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json pour optimiser le cache
COPY package*.json ./

# Installer les dépendances
RUN npm install --only=production

# Copier tout le code source
COPY . .

#Copie les secret de cloud run
RUN echo "$ENV" > .env
RUN echo "$FIREBASE_CONFIG" > firebase-service-account.json

# Compiler l'application (si TypeScript)
RUN npm run build

# Étape 2 : Image finale optimisée
FROM node:18-alpine AS runner

# Définir le répertoire de travail
WORKDIR /app

# Copier uniquement les fichiers nécessaires depuis le builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Définir la variable d'environnement pour NestJS
ENV NODE_ENV=production

# Lancer l'application
CMD ["node", "dist/main.js"]
