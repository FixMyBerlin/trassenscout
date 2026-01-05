/**
 * Health Check Server
 * Simple HTTP endpoint for Docker health checks and external monitoring
 */

import http, { type IncomingMessage, type ServerResponse } from "http"
import { config } from "./helpers/config.js"
import { log } from "./helpers/logger.js"

const port = config.health.port

http
  .createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(
        JSON.stringify({
          status: "ok",
          service: "imap-listener",
          timestamp: new Date().toISOString(),
        }),
      )
    } else {
      res.writeHead(404, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: "Not Found" }))
    }
  })
  .listen(port, () => {
    log.info("Health check server started", { port })
  })
