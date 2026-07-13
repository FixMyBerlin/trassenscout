import { createFileRoute } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { serveProjectUploadObject } from "@/src/server/uploads/serveUploadObject.server"
import { AuthorizationError } from "@/src/shared/auth/errors"

/**
 * Authenticated proxy that streams an upload's binary content from S3 by numeric
 * id. Used by `uploadUrl()` for both `<img>` previews and download links, so the
 * S3 bucket can stay private and access is gated per project membership.
 *
 * This is the canonical, filename-less route: `/api/:projectSlug/uploads/:id`,
 * matching what `uploadUrl()` builds under the router's `trailingSlash: "never"`.
 * The sibling `$/index.ts` splat route only exists to keep older links that still
 * carry the original filename in the path working.
 *
 * `ssr: false` because this is a handler-only API route (no React component); the
 * `server.handlers.GET` still runs on the server regardless. Authorization is
 * enforced inside `serveProjectUploadObject` (project membership), which is why
 * `endpointAuth.inherited` is used here instead of a gate in this file.
 */
export const Route = createFileRoute("/api/$projectSlug/uploads/$uploadId/")({
  ssr: false,
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        endpointAuth.inherited("auth enforced in serveProjectUploadObject")
        try {
          const download = new URL(request.url).searchParams.has("download")
          return await serveProjectUploadObject(
            request.headers,
            {
              projectSlug: params.projectSlug,
              uploadId: params.uploadId,
            },
            { download },
          )
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
