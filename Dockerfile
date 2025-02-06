# Étape 1 : Build de l'application
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN echo "$ENV" > .env
RUN echo "$FIREBASE_CONFIG" > firebase-service-account.json

# Vérification des fichiers
RUN if [ ! -s .env ]; then \
    echo ".env file is missing or empty" && exit 1; \
    else echo ".env file exists and is not empty"; \
    fi

RUN if [ ! -s firebase-service-account.json ]; then \
    echo "firebase-service-account.json is missing or empty" && exit 1; \
    fi && \
    if ! jq '.' firebase-service-account.json > /dev/null 2>&1; then \
    echo "firebase-service-account.json is not a valid JSON" && exit 1; \
    else echo "firebase-service-account.json is valid JSON"; \
    fi \

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