import { createFileRoute } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { isRateLimitError } from "@/src/server/externalShare/_utils/isRateLimitError"
import { serveExternalShareGeojson } from "@/src/server/externalShare/publicExternalShare.server"

export const Route = createFileRoute("/api/share/$token/subsubsections/")({
  ssr: false,
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        endpointAuth.inherited("token checked in serveExternalShareGeojson")
        try {
          return await serveExternalShareGeojson(request.headers, params)
        } catch (error) {
          if (isRateLimitError(error)) return new Response("Too Many Requests", { status: 429 })
          console.error("External share GeoJSON error:", error)
          return new Response("Internal Server Error", { status: 500 })
        }
      },
    },
  },
})
