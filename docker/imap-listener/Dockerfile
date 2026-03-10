FROM node:24-trixie-slim

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

# Don't use root user for execution, see https://www.docker.com/blog/understanding-the-docker-user-instruction/
RUN chown -R node:node /app
USER 1000:1000

# Entrypoint: IMAP-Listener starten
ENTRYPOINT ["node", "dist/index.js"]
