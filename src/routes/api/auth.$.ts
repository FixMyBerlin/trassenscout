import { createFileRoute } from "@tanstack/react-router"
import { auth } from "@/src/server/auth/auth.server"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"

export const Route = createFileRoute("/api/auth/$")({
  ssr: false,
  server: {
    handlers: {
      GET: ({ request }) => {
        endpointAuth.public("Better Auth session handler")
        return auth.handler(request)
      },
      POST: ({ request }) => {
        endpointAuth.public("Better Auth session handler")
        return auth.handler(request)
      },
    },
  },
})
