# Użycie oficjalnego obrazu Node.js
FROM node:18-alpine

# Instalacja zależności systemowych do budowania natywnych modułów
RUN apk add --no-cache python3 make g++

# Ustawienie katalogu roboczego
WORKDIR /app

# Kopiowanie plików package.json i package-lock.json przed instalacją
COPY package*.json ./

# Instalacja globalnego NestJS CLI
RUN npm install -g @nestjs/cli

# Instalacja zależności aplikacji
RUN npm install --omit=dev  && npm install --save-dev @types/express

# Kopiowanie reszty aplikacji
COPY . .

# Generowanie Prisma Client
RUN npx prisma generate

# Budowanie aplikacji
RUN npm run build

# Otwieranie portu
EXPOSE 3000

# Uruchomienie aplikacji w trybie produkcyjnym
CMD ["npm", "run", "start:prod"]
