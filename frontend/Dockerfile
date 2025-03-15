# Użycie oficjalnego obrazu Node.js jako buildera
FROM node:18-alpine AS builder

# Ustawienie katalogu roboczego
WORKDIR /app

# Kopiowanie package.json i package-lock.json przed instalacją zależności
COPY package*.json ./

# Instalacja zależności
RUN npm install

# Kopiowanie reszty plików aplikacji
COPY . .

# Budowanie aplikacji
RUN npm run build

# Użycie Nginx jako serwera produkcyjnego
FROM nginx:alpine

# Kopiowanie plików statycznych do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Eksponowanie portu 80
EXPOSE 80

# Uruchamianie Nginx
CMD ["nginx", "-g", "daemon off;"]
