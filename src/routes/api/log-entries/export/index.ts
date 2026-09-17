import { createFileRoute } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { exportLogEntriesCsv } from "@/src/server/logEntries/logEntriesCsvExport.server"
import { handleSurveyCsvRouteError } from "@/src/server/surveys/csv/handleSurveyCsvRouteError.server"
import { logEntriesSearchSchema } from "@/src/shared/logEntries/searchSchemas"

export const Route = createFileRoute("/api/log-entries/export/")({
  ssr: false,
  server: {
    handlers: {
      GET: async ({ request }) => {
        endpointAuth.inherited("auth enforced in exportLogEntriesCsv")
        try {
          const search = new URL(request.url).searchParams
          const input = logEntriesSearchSchema.parse(Object.fromEntries(search))

          return await exportLogEntriesCsv(request.headers, input)
        } catch (error) {
          return handleSurveyCsvRouteError(error)
        }
      },
    },
  },
})
