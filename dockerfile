# Étape 1 : Build de l'application
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN echo "$ENV" > .env
RUN echo "$FIREBASE_CONFIG" > firebase-service-account.json

RUN npm run build

# Étape 2 : Image finale optimisée
FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/firebase-service-account.json ./firebase-service-account.json

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "dist/main.js"]