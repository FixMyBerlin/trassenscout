# IMAP Listener Service

Long-running Node.js Service, der ein IMAP-Postfach überwacht und neue E-Mails an die Trassenscout-API weiterleitet.

## Funktionalität

- **Beim Start**: Alle nicht SEEN Mails werden abgearbeitet
- **Im IDLE-Modus**: Neue eingehende Mails werden sofort verarbeitet
- **Pro Mail**:
  - Inhalt lesen
  - API-Call an TS-API (Webhook)
  - Bei Erfolg → Mail als SEEN markieren + Move zu `/DONE`
  - Bei Fehler → Mail als SEEN markieren + Move zu `/ERROR`
- **Verarbeitung**: 10 Sekunden Delay zwischen Aufträgen zur API-Entlastung

## Wichtige Mailbox-Voraussetzungen

- Pro IMAP-Postfach müssen die Zielordner **`INBOX/DONE`** und **`INBOX/ERROR`** existieren.
- Fehlen diese Ordner, startet der Listener nicht korrekt (Startup-Check schlägt fehl).
- Bei neuen Mailadressen/Postfächern (z.B. dev/staging/prod) die beiden Ordner immer zuerst anlegen.

## Konfiguration

**Deploy:** `IMAP_*` and `TS_API_KEY` come from GitHub (see [`.github/env/deploy.manifest.json`](../.github/env/deploy.manifest.json)) and land in the server root `.env` via the deploy workflow.

**Local dev:** copy [`imap-listener/.env.example`](./.env.example) to `imap-listener/.env`. [`docker-compose.override.yml`](../docker-compose.override.yml) loads that file for the `imap-listener` service (`env_file: ./imap-listener/.env`).

Secrets and connection-specific values are validated in [`src/helpers/config.ts`](./src/helpers/config.ts).
Static defaults (folders, webhook path, delays, health port) live in [`src/helpers/constants.ts`](./src/helpers/constants.ts).

### Log-Ereignisse

- **Verbindungsstatus**: Erfolg/Fehler beim IMAP-Connect
- **Pro Mail**: UID, Betreff, Verarbeitungsstatus
- **API-Calls**: URL, Status, Response-Zeit
- **Retries**: Versuchsanzahl, Fehlergrund
- **Fehler**: Vollständige Error-Objekte mit Stack-Trace

## Health Check

Der Service stellt einen HTTP-Endpoint auf Port 3100 bereit:

```bash
GET /health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2025-11-04T10:30:00.000Z",
  "service": "imap-listener",
  "connected": true,
  "unreadCount": 5,
  "processedCount": 42,
  "errorCount": 1
}
```

Docker führt automatisch Health Checks durch (alle 30s).

## Restart

Der Service startet automatisch bei jedem Deploy neu.

**Manueller Restart**: Um alle E-Mails in der INBOX erneut zu verarbeiten (z.B. wenn vorher ein Fehler aufgetreten ist oder die Verarbeitung übersprungen wurde), einfach den Service neu starten.

Beim Neustart werden alle nicht-SEEN E-Mails in der INBOX erneut verarbeitet.

## Entwicklung

### Lokal testen

```bash
cp .env.example .env
# .env konfigurieren

docker compose up -d
```

### Logs ansehen

```bash
docker compose logs -f imap-listener
```
