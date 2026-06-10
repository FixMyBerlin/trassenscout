import { createFileRoute } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { exportSubsectionSubsubsectionsCsv } from "@/src/server/subsections/subsubsectionCsvExport.server"
import { handleSurveyCsvRouteError } from "@/src/server/surveys/csv/handleSurveyCsvRouteError.server"

export const Route = createFileRoute(
  "/api/$projectSlug/subsections/$subsectionSlug/subsubsections/export/",
)({
  ssr: false,
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        endpointAuth.inherited("auth enforced in exportSubsectionSubsubsectionsCsv")
        try {
          return await exportSubsectionSubsubsectionsCsv(
            request.headers,
            params.projectSlug,
            params.subsectionSlug,
          )
        } catch (error) {
          return handleSurveyCsvRouteError(error)
        }
      },
    },
  },
})
