import { createFileRoute } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"

const logEntryRetentionDays = 365

function getRetentionCutoffDate() {
  const date = new Date()
  date.setDate(date.getDate() - logEntryRetentionDays)
  return date
}

export const Route = createFileRoute("/api/cron-logEntries-cleanup/")({
  ssr: false,
  server: {
    handlers: {
      GET: async ({ request }) => {
        endpointAuth.apiKey(request)

        const deleted = await db.logEntry.deleteMany({
          where: { createdAt: { lt: getRetentionCutoffDate() } },
        })

        return Response.json({ deleted: deleted.count, retentionDays: logEntryRetentionDays })
      },
    },
  },
})
