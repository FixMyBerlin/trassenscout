import { createFileRoute } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { exportOhvSubsubsectionCsv } from "@/src/server/subsections/ohvSubsubsectionCsvExport.server"
import { exportProjectSubsubsectionsCsv } from "@/src/server/subsections/subsubsectionCsvExport.server"
import { handleSurveyCsvRouteError } from "@/src/server/surveys/csv/handleSurveyCsvRouteError.server"

export const Route = createFileRoute("/api/$projectSlug/subsections/export/")({
  ssr: false,
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        endpointAuth.inherited(
          "auth enforced in exportOhvSubsubsectionCsv or exportProjectSubsubsectionsCsv",
        )
        try {
          if (params.projectSlug === "ohv") {
            return await exportOhvSubsubsectionCsv(request.headers, params.projectSlug)
          }
          return await exportProjectSubsubsectionsCsv(request.headers, params.projectSlug)
        } catch (error) {
          return handleSurveyCsvRouteError(error)
        }
      },
    },
  },
})
