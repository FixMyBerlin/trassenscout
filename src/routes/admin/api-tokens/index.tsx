import { createFileRoute } from "@tanstack/react-router"
import { PageApiTokens } from "@/src/components/admin/api-tokens/PageApiTokens"
import { adminTitleHead } from "@/src/routeHead"
import { getAdminApiTokensLoaderFn } from "@/src/server/admin/adminApiTokens.functions"

export const Route = createFileRoute("/admin/api-tokens/")({
  head: () => adminTitleHead("API-Tokens (MCP)"),
  ssr: true,
  loader: async () => await getAdminApiTokensLoaderFn(),
  component: function AdminApiTokensPage() {
    const { tokens } = Route.useLoaderData()
    return <PageApiTokens tokens={tokens} />
  },
})
