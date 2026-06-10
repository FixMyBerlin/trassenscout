import { createFileRoute } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { serveSupportDocumentObject } from "@/src/server/supportDocuments/serveSupportDocument.server"
import { AuthorizationError } from "@/src/shared/auth/errors"

export const Route = createFileRoute("/api/support/documents/$documentId/$/")({
  ssr: false,
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        endpointAuth.inherited("auth enforced in serveSupportDocumentObject")
        try {
          return await serveSupportDocumentObject(request.headers, {
            documentId: params.documentId,
          })
        } catch (error) {
          if (error instanceof AuthorizationError) {
            return new Response("Unauthorized", { status: 401 })
          }
          console.error("Support document serve error:", error)
          return new Response("Internal Server Error", { status: 500 })
        }
      },
    },
  },
})
