import { createFileRoute } from "@tanstack/react-router"
import { PageAdminMcpDrafts } from "@/src/components/pages/admin/mcp-drafts/PageAdminMcpDrafts"
import { adminTitleHead } from "@/src/routeHead"
import { mcpDraftsGroupedQueryOptions } from "@/src/server/mcp/mcpDrafts/mcpDraftsQueryOptions"

export const Route = createFileRoute("/admin/mcp-drafts/")({
  head: () => adminTitleHead("MCP-Drafts"),
  ssr: true,
  loader: ({ context }) => context.queryClient.ensureQueryData(mcpDraftsGroupedQueryOptions()),
  component: PageAdminMcpDrafts,
})
