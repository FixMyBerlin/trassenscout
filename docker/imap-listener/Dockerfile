# Node.js 22 Bullseye Slim als Basis (konsistent mit der Hauptanwendung)
FROM node:22-bullseye-slim

# Arbeitsverzeichnis setzen
WORKDIR /app

# Package-Dateien kopieren (aus Root-Level imap-listener/)
COPY imap-listener/package*.json ./

# Dependencies installieren
RUN npm ci

# Sourcecode kopieren (aus Root-Level imap-listener/)
COPY imap-listener/ .

# TypeScript kompilieren
RUN npm run build

# Zeitzone setzen
ENV TZ=Europe/Berlin

# Health Check für Container-Monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node dist/healthcheck.js || exit 1

# Entrypoint: IMAP-Listener starten
ENTRYPOINT ["node", "dist/index.js"]
