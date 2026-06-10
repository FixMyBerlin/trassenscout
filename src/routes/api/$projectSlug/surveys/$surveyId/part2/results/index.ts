import { createFileRoute } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { handleSurveyCsvRouteError } from "@/src/server/surveys/csv/handleSurveyCsvRouteError.server"
import { exportPart2ResultsCsv } from "@/src/server/surveys/csv/part2CsvExport.server"

export const Route = createFileRoute("/api/$projectSlug/surveys/$surveyId/part2/results/")({
  ssr: false,
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        endpointAuth.inherited("auth enforced in exportPart2ResultsCsv")
        try {
          return await exportPart2ResultsCsv(
            request.headers,
            params.projectSlug,
            Number(params.surveyId),
          )
        } catch (error) {
          return handleSurveyCsvRouteError(error)
        }
      },
    },
  },
})
