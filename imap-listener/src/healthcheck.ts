/**
 * Health Check Server
 */

import http, { type IncomingMessage, type ServerResponse } from "http"
import { config } from "./helpers/config"
import { getMailboxStats } from "./helpers/imap"
import { log } from "./helpers/logger"

const port = config.health.port

http
  .createServer(async (req: IncomingMessage, res: ServerResponse) => {
    if (req.url === "/health") {
      try {
        const stats = await getMailboxStats()

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            status: "healthy",
            service: "imap-listener",
            timestamp: new Date().toISOString(),
            mailbox: {
              inboxUnseen: stats.inboxUnseen,
              errorCount: stats.errorCount,
            },
          }),
        )
      } catch (error) {
        res.writeHead(503, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            status: "unhealthy",
            service: "imap-listener",
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : String(error),
          }),
        )
      }
    } else {
      res.writeHead(404, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: "Not Found" }))
    }
  })
  .listen(port, () => {
    log.info("Health check server started", { port })
  })
