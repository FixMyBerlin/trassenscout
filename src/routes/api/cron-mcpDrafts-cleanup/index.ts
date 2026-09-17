import { createFileRoute } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import {
  getMcpDraftRetentionCutoffDate,
  MCP_DRAFT_RETENTION_DAYS,
} from "@/src/server/mcp/mcpDraftRetention.const"

export const Route = createFileRoute("/api/cron-mcpDrafts-cleanup/")({
  ssr: false,
  server: {
    handlers: {
      GET: async ({ request }) => {
        endpointAuth.apiKey(request)

        const deleted = await db.mcpDraft.deleteMany({
          where: { updatedAt: { lt: getMcpDraftRetentionCutoffDate() } },
        })

        return Response.json({ deleted: deleted.count, retentionDays: MCP_DRAFT_RETENTION_DAYS })
      },
    },
  },
})
