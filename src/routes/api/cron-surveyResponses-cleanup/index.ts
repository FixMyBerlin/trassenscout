import { createFileRoute } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"

const staleDraftSurveyResponseDays = 1

function getStaleSurveyResponseCutoffDate() {
  const date = new Date()
  date.setDate(date.getDate() - staleDraftSurveyResponseDays)
  return date
}

export const Route = createFileRoute("/api/cron-surveyResponses-cleanup/")({
  ssr: false,
  server: {
    handlers: {
      GET: async ({ request }) => {
        endpointAuth.apiKey(request)

        const deleted = await db.surveyResponse.deleteMany({
          where: {
            state: "CREATED",
            surveySession: { updatedAt: { lt: getStaleSurveyResponseCutoffDate() } },
          },
        })

        return Response.json({
          deleted: deleted.count,
          staleAfterDays: staleDraftSurveyResponseDays,
        })
      },
    },
  },
})
