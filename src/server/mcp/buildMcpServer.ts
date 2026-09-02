import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type { AdminApiAuth } from "@/src/server/api/admin/guardAdminApi.server"
import { mcpEnvLabel } from "@/src/server/mcp/mcpCursorConfig"
import { MCP_LIST_DEFAULT_LIMIT, MCP_LIST_MAX_LIMIT } from "@/src/server/mcp/mcpListLimit.const"
import { mcpToolOk, runMcpTool } from "@/src/server/mcp/mcpToolHelpers"
import { listFuehrungenForMcp } from "@/src/server/mcp/queries/listFuehrungenForMcp.server"
import { listProjectsForMcp } from "@/src/server/mcp/queries/listProjectsForMcp.server"

const mcpListLimitSchema = z
  .number()
  .int()
  .min(1)
  .max(MCP_LIST_MAX_LIMIT)
  .optional()
  .describe(`Max rows to return (default ${MCP_LIST_DEFAULT_LIMIT}, max ${MCP_LIST_MAX_LIMIT})`)

export function buildMcpServer({ auth: _auth, request }: { auth: AdminApiAuth; request: Request }) {
  const envLabel = mcpEnvLabel(process.env.VITE_APP_ENV)
  const origin = process.env.VITE_APP_ORIGIN ?? new URL(request.url).origin

  const server = new McpServer(
    { name: `trassenscout-admin--${envLabel}`, version: "1.0.0" },
    {
      instructions:
        `Trassenscout admin tools bound to the ${envLabel} environment (${origin}). ` +
        `Read-only — no write tools. Call env_info first to confirm the target environment. ` +
        `List tools default to ${MCP_LIST_DEFAULT_LIMIT} rows (max ${MCP_LIST_MAX_LIMIT}) and return ` +
        `limit, returned, and truncated when more rows exist. ` +
        `projects_list returns slug, subTitle, shortTitle, url, paCount, fuehrungCount. ` +
        `fuehrungen_list requires projectSlug; optional subsectionSlug filters to one Planungsabschnitt.`,
    },
  )

  server.registerTool(
    "env_info",
    {
      description:
        "Report which Trassenscout environment (DEV/STG/PRD) and origin this MCP server is bound to. " +
        "Call this first to confirm the target environment.",
    },
    () => mcpToolOk({ environment: envLabel, origin, viteAppEnv: process.env.VITE_APP_ENV }),
  )

  server.registerTool(
    "projects_list",
    {
      description:
        `List projects (default limit ${MCP_LIST_DEFAULT_LIMIT}, max ${MCP_LIST_MAX_LIMIT}). ` +
        "Response includes limit, returned, truncated. Per project: slug, subTitle, shortTitle " +
        "(uppercase slug), url, paCount (Planungsabschnitte), fuehrungCount (Führungen / Maßnahmen).",
      inputSchema: {
        limit: mcpListLimitSchema,
      },
    },
    ({ limit }) => runMcpTool(() => listProjectsForMcp(origin, limit)),
  )

  server.registerTool(
    "fuehrungen_list",
    {
      description:
        `List Führungen (Maßnahmen) for a project (default limit ${MCP_LIST_DEFAULT_LIMIT}, ` +
        `max ${MCP_LIST_MAX_LIMIT}). Response includes limit, returned, truncated. ` +
        "Requires projectSlug; optional subsectionSlug. Per row: projectSlug, subsectionSlug, slug, " +
        "url — no descriptions or geometry.",
      inputSchema: {
        projectSlug: z.string(),
        subsectionSlug: z.string().optional(),
        limit: mcpListLimitSchema,
      },
    },
    ({ projectSlug, subsectionSlug, limit }) =>
      runMcpTool(() => listFuehrungenForMcp({ projectSlug, subsectionSlug, origin, limit })),
  )

  return server
}
