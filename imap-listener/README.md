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

## Konfiguration

Die Konfiguration findet in `.env` statt bzw. über GitHub Secrets statt.
Erstelle dafür aus der `.env.example` eine die `.env` Datei für das lokale Setup.

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
