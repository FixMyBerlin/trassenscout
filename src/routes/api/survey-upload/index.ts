import { createFileRoute } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { handleSurveyUploadRoute } from "@/src/server/uploads/upload-route-handlers.server"

export const Route = createFileRoute("/api/survey-upload/")({
  ssr: false,
  server: {
    handlers: {
      POST: ({ request }) => {
        endpointAuth.inherited("auth enforced in handleSurveyUploadRoute")
        return handleSurveyUploadRoute(request)
      },
    },
  },
})
