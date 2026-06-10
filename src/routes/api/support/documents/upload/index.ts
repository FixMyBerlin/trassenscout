import { createFileRoute } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { handleSupportDocumentUploadRoute } from "@/src/server/uploads/upload-route-handlers.server"

export const Route = createFileRoute("/api/support/documents/upload/")({
  ssr: false,
  server: {
    handlers: {
      POST: ({ request }) => {
        endpointAuth.inherited("auth enforced in handleSupportDocumentUploadRoute")
        return handleSupportDocumentUploadRoute(request)
      },
    },
  },
})
