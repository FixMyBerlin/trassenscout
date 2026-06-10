import { createFileRoute } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { serveProjectUploadObject } from "@/src/server/uploads/serveUploadObject.server"
import { AuthorizationError } from "@/src/shared/auth/errors"

export const Route = createFileRoute("/api/$projectSlug/uploads/$uploadId/$/")({
  ssr: false,
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        endpointAuth.inherited("auth enforced in serveProjectUploadObject")
        try {
          return await serveProjectUploadObject(request.headers, {
            projectSlug: params.projectSlug,
            uploadId: params.uploadId,
          })
        } catch (error) {
          if (error instanceof AuthorizationError) {
            return new Response("Unauthorized", { status: 401 })
          }
          console.error("Upload serve error:", error)
          return new Response("Internal Server Error", { status: 500 })
        }
      },
    },
  },
})
