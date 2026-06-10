import { createFileRoute } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import {
  INVITE_DAYS_TO_DELETION,
  INVITE_DAYS_TO_EXPIRED,
} from "@/src/server/invites/inviteSettings.const"

function getDaysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

export const Route = createFileRoute("/api/cron-invites-cleanup/")({
  ssr: false,
  server: {
    handlers: {
      GET: async ({ request }) => {
        endpointAuth.apiKey(request)

        const expired = await db.invite.updateMany({
          where: {
            status: "PENDING",
            updatedAt: { lt: getDaysAgo(INVITE_DAYS_TO_EXPIRED) },
          },
          data: { status: "EXPIRED" },
        })
        const deleted = await db.invite.deleteMany({
          where: {
            status: { in: ["ACCEPTED", "EXPIRED"] },
            updatedAt: { lt: getDaysAgo(INVITE_DAYS_TO_DELETION) },
          },
        })

        return Response.json({ deleted: deleted.count, expired: expired.count })
      },
    },
  },
})
