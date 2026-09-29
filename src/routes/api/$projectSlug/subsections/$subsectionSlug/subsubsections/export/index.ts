import { createFileRoute } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { exportOhvSubsubsectionCsv } from "@/src/server/subsections/ohvSubsubsectionCsvExport.server"
import { exportSubsectionSubsubsectionsCsv } from "@/src/server/subsections/subsubsectionCsvExport.server"
import { handleSurveyCsvRouteError } from "@/src/server/surveys/csv/handleSurveyCsvRouteError.server"

export const Route = createFileRoute(
  "/api/$projectSlug/subsections/$subsectionSlug/subsubsections/export/",
)({
  ssr: false,
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        endpointAuth.inherited(
          "auth enforced in exportOhvSubsubsectionCsv or exportSubsectionSubsubsectionsCsv",
        )
        try {
          if (params.projectSlug === "ohv") {
            return await exportOhvSubsubsectionCsv(
              request.headers,
              params.projectSlug,
              params.subsectionSlug,
            )
          }
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
