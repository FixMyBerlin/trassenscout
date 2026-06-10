/**
 * E2E-only probe: Playwright global setup (`assertE2eServerEnv`) calls this before tests
 * to see whether something is already listening on the base URL. With `reuseExistingServer`,
 * Playwright would reuse a leftover `bun run dev` process — same DB, but without `.env.test`
 * settings (e.g. `VITE_IS_TEST=true` for map stubs and disabled auth rate limits). Setup
 * aborts in that case. Returns 404 outside development.
 */
import { createFileRoute } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"

export const Route = createFileRoute("/api/e2e/server-env/")({
  ssr: false,
  server: {
    handlers: {
      GET: () => {
        endpointAuth.public("E2E server env probe (development only)")

        if (process.env.VITE_APP_ENV !== "development") {
          return new Response(null, { status: 404 })
        }

        return Response.json({
          isTest: process.env.VITE_IS_TEST === "true",
        })
      },
    },
  },
})
