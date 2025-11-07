/**
 * Health Check Server
 */

import http, { type IncomingMessage, type ServerResponse } from 'http';

const port = 3100

http.createServer((req: IncomingMessage, res: ServerResponse) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: "healthy",
        service: "imap-listener",
        timestamp: new Date().toISOString(),
      }),
    )
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
}).listen(port, () => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Health check server started',
    port
  }));
});
