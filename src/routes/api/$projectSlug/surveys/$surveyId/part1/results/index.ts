import { createFileRoute } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { handleSurveyCsvRouteError } from "@/src/server/surveys/csv/handleSurveyCsvRouteError.server"
import { exportPart1ResultsCsv } from "@/src/server/surveys/csv/part1CsvExport.server"

export const Route = createFileRoute("/api/$projectSlug/surveys/$surveyId/part1/results/")({
  ssr: false,
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        endpointAuth.inherited("auth enforced in exportPart1ResultsCsv")
        try {
          return await exportPart1ResultsCsv(
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
