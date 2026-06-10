import { createFileRoute } from "@tanstack/react-router"
import { forwardAuthAndApplyCookies } from "@/src/server/auth/auth-route-handler.server"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"

export const Route = createFileRoute("/api/auth/$")({
  ssr: false,
  server: {
    handlers: {
      GET: ({ request }) => {
        endpointAuth.public("Better Auth session handler")
        return forwardAuthAndApplyCookies(request)
      },
      POST: ({ request }) => {
        endpointAuth.public("Better Auth session handler")
        return forwardAuthAndApplyCookies(request)
      },
    },
  },
})
