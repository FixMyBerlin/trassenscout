import { createFileRoute } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import {
  publicShareErrorResponse,
  serveExternalShareGeojson,
} from "@/src/server/externalShare/publicExternalShare.server"

export const Route = createFileRoute("/api/share/$token/subsubsections/")({
  ssr: false,
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        endpointAuth.inherited("token checked in serveExternalShareGeojson")
        try {
          return await serveExternalShareGeojson(request.headers, params)
        } catch (error) {
          return publicShareErrorResponse(error, "External share GeoJSON error:")
        }
      },
    },
  },
})
