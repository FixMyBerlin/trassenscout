import { createFileRoute } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { handleProjectUploadRoute } from "@/src/server/uploads/upload-route-handlers.server"

export const Route = createFileRoute("/api/$projectSlug/upload/")({
  ssr: false,
  server: {
    handlers: {
      POST: ({ request, params }) => {
        endpointAuth.inherited("auth enforced in handleProjectUploadRoute")
        return handleProjectUploadRoute(request, params.projectSlug)
      },
    },
  },
})
