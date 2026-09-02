import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type { AdminApiAuth } from "@/src/server/api/admin/guardAdminApi.server"
import {
  fuehrungMcpPreviewInputSchema,
  fuehrungMcpUpdateInputSchema,
} from "@/src/server/mcp/fuehrungUpdate/patchSchema"
import { mcpEnvLabel } from "@/src/server/mcp/mcpCursorConfig"
import { MCP_LIST_DEFAULT_LIMIT, MCP_LIST_MAX_LIMIT } from "@/src/server/mcp/mcpListLimit.const"
import { mcpToolOk, runMcpTool } from "@/src/server/mcp/mcpToolHelpers"
import { getFuehrungenSchemaForMcp } from "@/src/server/mcp/queries/getFuehrungenSchemaForMcp.server"
import { listFuehrungenForMcp } from "@/src/server/mcp/queries/listFuehrungenForMcp.server"
import { listProjectsForMcp } from "@/src/server/mcp/queries/listProjectsForMcp.server"
import {
  previewFuehrungUpdateForMcp,
  updateFuehrungForMcp,
} from "@/src/server/mcp/queries/updateFuehrungForMcp.server"

const mcpListLimitSchema = z
  .number()
  .int()
  .min(1)
  .max(MCP_LIST_MAX_LIMIT)
  .optional()
  .describe(`Max rows to return (default ${MCP_LIST_DEFAULT_LIMIT}, max ${MCP_LIST_MAX_LIMIT})`)

const patchSemantics =
  "MCP patch semantics differ from the form: omit a key to leave it unchanged. null and empty string do not clear values. " +
  "Empty arrays are not allowed for subsubsectionInfrastructureTypeSlugs (omit the key instead). " +
  "subsubsectionInfrastructureTypeSlugs replaces the whole set when present with at least one slug."

export function buildMcpServer({ auth, request }: { auth: AdminApiAuth; request: Request }) {
  const envLabel = mcpEnvLabel(process.env.VITE_APP_ENV)
  const origin = process.env.VITE_APP_ORIGIN ?? new URL(request.url).origin

  const server = new McpServer(
    { name: `trassenscout-admin--${envLabel}`, version: "1.0.0" },
    {
      instructions:
        `Trassenscout admin tools bound to the ${envLabel} environment (${origin}). ` +
        `Call env_info first to confirm the target environment. ` +
        `Then projects_list — only continue with slugs where mcpEnabled is true. ` +
        `If the target project is disabled, stop and ask an admin to enable MCP in /admin/projects (column MCP). ` +
        `Do not call other project tools for a disabled slug. ` +
        `mcpEnabled does not replace preview or confirm. ` +
        `After env_info and an enabled slug: fuehrungen_schema, then fuehrungen_list. ` +
        `To change a Führung: fuehrungen_update_preview, show the diff (including overwrite warnings) to the user, then fuehrungen_update with confirm: true. ` +
        `Identity is always projectSlug + subsectionSlug + slug; there is no create. ` +
        `${patchSemantics} ` +
        `After a migration, ask an admin to turn MCP off again. ` +
        `List tools default to ${MCP_LIST_DEFAULT_LIMIT} rows (max ${MCP_LIST_MAX_LIMIT}) and return ` +
        `limit, returned, and truncated when more rows exist. ` +
        `projects_list returns slug, subTitle, shortTitle, url, paCount, fuehrungCount, mcpEnabled. ` +
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
        "(uppercase slug), url, paCount (Planungsabschnitte), fuehrungCount (Führungen / Maßnahmen), mcpEnabled. " +
        "Includes disabled projects so you can see the slug; only use slugs with mcpEnabled true for other project tools.",
      inputSchema: {
        limit: mcpListLimitSchema,
      },
    },
    ({ limit }) => runMcpTool(() => listProjectsForMcp(origin, limit)),
  )

  server.registerTool(
    "fuehrungen_schema",
    {
      description:
        "Field metadata, extra field definitions, and lookup options for Führung updates. Requires mcpEnabled. " +
        "writable false for slug, geometry, type, subsectionId and other non-MCP fields. " +
        "Relations use slugs from this payload, not IDs. extraFields is Record<string,string>; keys are listed in extraFields. " +
        "Lookups return { id, slug, title }. Fixed enum location returns { slug, title } (no id). " +
        "Does not include labelPos, managers, operators, tags, survey, acquisition, or subsubsectionSpecials. " +
        patchSemantics,
      inputSchema: {
        projectSlug: z.string(),
      },
    },
    ({ projectSlug }) => runMcpTool(() => getFuehrungenSchemaForMcp(projectSlug)),
  )

  server.registerTool(
    "fuehrungen_list",
    {
      description:
        `List Führungen (Maßnahmen) for a project (default limit ${MCP_LIST_DEFAULT_LIMIT}, ` +
        `max ${MCP_LIST_MAX_LIMIT}). Requires mcpEnabled. Response includes limit, returned, truncated. ` +
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

  server.registerTool(
    "fuehrungen_update_preview",
    {
      description:
        "Dry-run a Führung patch. Requires mcpEnabled. Loads the record internally (no fuehrungen_get). " +
        "Returns changes (kind set|overwrite), overwrite warnings, errors. okToWrite is true when there are no errors and at least one change. " +
        patchSemantics,
      inputSchema: fuehrungMcpPreviewInputSchema.shape,
    },
    (input) =>
      runMcpTool(() =>
        previewFuehrungUpdateForMcp({
          ...input,
          origin,
        }),
      ),
  )

  server.registerTool(
    "fuehrungen_update",
    {
      description:
        "Apply a Führung patch. Requires mcpEnabled and confirm: true after preview. Does not create records. " +
        patchSemantics,
      inputSchema: fuehrungMcpUpdateInputSchema.shape,
    },
    (input) =>
      runMcpTool(() =>
        updateFuehrungForMcp({
          ...input,
          origin,
          createdById: auth.createdById,
        }),
      ),
  )

  return server
}
