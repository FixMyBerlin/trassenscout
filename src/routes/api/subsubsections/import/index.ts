import { createFileRoute } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { importSubsubsectionFromApi } from "@/src/server/subsubsections/importSubsubsectionApi.server"
import { AuthorizationError } from "@/src/shared/auth/errors"

export const Route = createFileRoute("/api/subsubsections/import/")({
  ssr: false,
  server: {
    handlers: {
      POST: async ({ request }) => {
        endpointAuth.inherited("auth enforced in importSubsubsectionFromApi")
        try {
          return await importSubsubsectionFromApi(request)
        } catch (error) {
          if (error instanceof AuthorizationError) {
            return Response.json({ error: "Unauthorized" }, { status: 401 })
          }
          console.error("Subsubsection import error:", error)
          return Response.json({ error: "Internal server error" }, { status: 500 })
        }
      },
    },
  },
})
