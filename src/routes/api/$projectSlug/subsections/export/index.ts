import { createFileRoute } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { exportProjectSubsubsectionsCsv } from "@/src/server/subsections/subsubsectionCsvExport.server"
import { handleSurveyCsvRouteError } from "@/src/server/surveys/csv/handleSurveyCsvRouteError.server"

export const Route = createFileRoute("/api/$projectSlug/subsections/export/")({
  ssr: false,
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        endpointAuth.inherited("auth enforced in exportProjectSubsubsectionsCsv")
        try {
          return await exportProjectSubsubsectionsCsv(request.headers, params.projectSlug)
        } catch (error) {
          return handleSurveyCsvRouteError(error)
        }
      },
    },
  },
})
