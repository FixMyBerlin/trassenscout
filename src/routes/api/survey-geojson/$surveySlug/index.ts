import { createFileRoute } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { getSurveyGeojsonBySlug } from "@/src/server/surveys/geojson/getSurveyGeojsonBySlug.server"

export const Route = createFileRoute("/api/survey-geojson/$surveySlug/")({
  ssr: false,
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        endpointAuth.apiKey(request)

        const debug = new URL(request.url).searchParams.has("debug")
        return getSurveyGeojsonBySlug({ surveySlug: params.surveySlug, debug })
      },
    },
  },
})
