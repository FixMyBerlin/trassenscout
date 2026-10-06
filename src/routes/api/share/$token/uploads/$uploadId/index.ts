import { createFileRoute } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { isRateLimitError } from "@/src/server/externalShare/_utils/isRateLimitError"
import { serveExternalShareUpload } from "@/src/server/externalShare/publicExternalShare.server"

export const Route = createFileRoute("/api/share/$token/uploads/$uploadId/")({
  ssr: false,
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        endpointAuth.inherited("token checked in serveExternalShareUpload")
        try {
          const download = new URL(request.url).searchParams.has("download")
          return await serveExternalShareUpload(request.headers, params, { download })
        } catch (error) {
          if (isRateLimitError(error)) return new Response("Too Many Requests", { status: 429 })
          console.error("External share upload error:", error)
          return new Response("Internal Server Error", { status: 500 })
        }
      },
    },
  },
})
