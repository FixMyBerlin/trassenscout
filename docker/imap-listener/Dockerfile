# Node.js 22 Bullseye Slim als Basis (konsistent mit der Hauptanwendung)
FROM node:22-bullseye-slim

# Arbeitsverzeichnis setzen
WORKDIR /app

# Package-Dateien kopieren
COPY package*.json ./

# Dependencies installieren
RUN npm ci

# Sourcecode kopieren
COPY . .

# TypeScript kompilieren
RUN npm run build

# Zeitzone setzen
ENV TZ=Europe/Berlin

# Entrypoint: IMAP-Listener starten
ENTRYPOINT ["node", "dist/index.js"]
