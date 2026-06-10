import { createFileRoute } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { importSubsectionFromApi } from "@/src/server/subsections/importSubsectionApi.server"
import { AuthorizationError } from "@/src/shared/auth/errors"

export const Route = createFileRoute("/api/subsections/import/")({
  ssr: false,
  server: {
    handlers: {
      POST: async ({ request }) => {
        endpointAuth.inherited("auth enforced in importSubsectionFromApi")
        try {
          return await importSubsectionFromApi(request)
        } catch (error) {
          if (error instanceof AuthorizationError) {
            return Response.json({ error: "Unauthorized" }, { status: 401 })
          }
          console.error("Subsection import error:", error)
          return Response.json({ error: "Internal server error" }, { status: 500 })
        }
      },
    },
  },
})
