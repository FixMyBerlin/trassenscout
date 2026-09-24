import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type { AdminApiAuth } from "@/src/server/api/admin/guardAdminApi.server"
import { deleteSubsectionForMcp } from "@/src/server/mcp/direct/deleteSubsectionForMcp.server"
import { deleteSubsubsectionForMcp } from "@/src/server/mcp/direct/deleteSubsubsectionForMcp.server"
import { mcpEnvLabel } from "@/src/server/mcp/mcpCursorConfig"
import { MCP_LIST_DEFAULT_LIMIT, MCP_LIST_MAX_LIMIT } from "@/src/server/mcp/mcpListLimit.const"
import { mcpToolOk, runMcpTool } from "@/src/server/mcp/mcpToolHelpers"
import { createSubsectionForMcp } from "@/src/server/mcp/queries/createSubsectionForMcp.server"
import { createSubsubsectionForMcp } from "@/src/server/mcp/queries/createSubsubsectionForMcp.server"
import { getSubsectionsSchemaForMcp } from "@/src/server/mcp/queries/getSubsectionsSchemaForMcp.server"
import { getSubsubsectionsSchemaForMcp } from "@/src/server/mcp/queries/getSubsubsectionsSchemaForMcp.server"
import { listProjectsForMcp } from "@/src/server/mcp/queries/listProjectsForMcp.server"
import { listSubsectionsForMcp } from "@/src/server/mcp/queries/listSubsectionsForMcp.server"
import { listSubsubsectionsForMcp } from "@/src/server/mcp/queries/listSubsubsectionsForMcp.server"
import { updateSubsectionForMcp } from "@/src/server/mcp/queries/updateSubsectionForMcp.server"
import { updateSubsubsectionForMcp } from "@/src/server/mcp/queries/updateSubsubsectionForMcp.server"
import {
  subsectionMcpCreateInputSchema,
  subsectionMcpDeleteInputSchema,
  subsectionMcpUpdateInputSchema,
} from "@/src/server/mcp/subsectionUpdate/patchSchema"
import {
  subsubsectionMcpCreateInputSchema,
  subsubsectionMcpDeleteInputSchema,
  subsubsectionMcpUpdateInputSchema,
} from "@/src/server/mcp/subsubsectionUpdate/patchSchema"

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
        `Then projects_list — only continue with slugs where mcpMode is "DRAFT" or "DIRECT". ` +
        `If mcpMode is "DISABLED", stop and ask an admin to enable MCP in /admin/projects (column MCP). ` +
        `Do not call other project tools for a disabled slug. ` +
        `mcpMode is the effective mode. "DIRECT" applies only while mcpDirectUntil is in the future; after that the effective mode is "DRAFT" until an admin turns direct write on again. ` +
        `In "DRAFT", create and update tools write McpDraft only. An admin applies drafts in the app (Einsetzen → form → Speichern / Erstellen). ` +
        `In "DIRECT", the same create and update tools write Subsection / Subsubsection immediately. ` +
        `Delete tools (subsections_delete, subsubsections_delete) exist only in "DIRECT". ` +
        `Without confirm they preview and write nothing. Show the user the preview (counts of protocols, uploads, acquisition areas, and for a Planungsabschnitt the Maßnahme count). ` +
        `Only then call again with confirm true. Confirm rejects a Maßnahme that still has protocols, uploads, or acquisition areas, and a Planungsabschnitt that still has Maßnahmen. ` +
        `User-facing terms: subsection = Planungsabschnitt, subsubsection = Maßnahme. ` +
        `After env_info and an enabled slug: subsections_schema then subsections_list, and/or subsubsections_schema then subsubsections_list. ` +
        `To change Planungsabschnitte: subsections_update with items (1–${MCP_LIST_MAX_LIMIT}). Identity is projectSlug + slug (PA Kürzel). ` +
        `To add Planungsabschnitte: subsections_create with items (1–${MCP_LIST_MAX_LIMIT}); patch must include type (LINE|POLYGON) and GeoJSON geometry (WGS84 [lng, lat]). ` +
        `To change Maßnahmen: subsubsections_update with items (1–${MCP_LIST_MAX_LIMIT}). ` +
        `To add Maßnahmen: subsubsections_create with items (1–${MCP_LIST_MAX_LIMIT}); patch must include type and GeoJSON geometry (WGS84 [lng, lat]). ` +
        `Each written item returns mode "drafted" or "applied" plus changes[].proposed. ` +
        `Show the user each item url and changes[].proposed. Geometry in the response is a short summary, not coordinates. ` +
        `Simplify lines before sending; max 5000 vertices; split large batches. ` +
        `Maßnahme identity is projectSlug + subsectionSlug + slug. Planungsabschnitt identity is projectSlug + slug. ` +
        `${patchSemantics} ` +
        `After a migration, ask an admin to turn MCP off again. ` +
        `List tools default to ${MCP_LIST_DEFAULT_LIMIT} rows (max ${MCP_LIST_MAX_LIMIT}) and return ` +
        `limit, returned, and truncated when more rows exist. ` +
        `projects_list returns slug, subTitle, shortTitle, url, paCount, subsubsectionCount, mcpMode, mcpDirectUntil. ` +
        `subsections_list requires projectSlug and returns slug, description, and url per Planungsabschnitt. ` +
        `subsubsections_list requires projectSlug; optional subsectionSlug filters to one Planungsabschnitt. ` +
        `It returns slug, description, and url per Maßnahme.`,
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
        "(uppercase slug), url, paCount (Planungsabschnitte), subsubsectionCount (Maßnahmen), mcpMode (DISABLED|DRAFT|DIRECT, effective), mcpDirectUntil. " +
        "Includes disabled projects so you can see the slug; only use slugs with mcpMode DRAFT or DIRECT for other project tools.",
      inputSchema: {
        limit: mcpListLimitSchema,
      },
    },
    ({ limit }) => runMcpTool(() => listProjectsForMcp(origin, limit)),
  )

  server.registerTool(
    "subsections_schema",
    {
      description:
        "Field metadata and lookup options for subsection (Planungsabschnitt) updates and creates. Requires mcpMode DRAFT or DIRECT. " +
        "Lookups as { id, slug, title }: operators, networkHierarchies, subsectionStatuses. " +
        "For updates, writable false for slug, geometry, type. For creates, slug is identity; type (LINE|POLYGON) and GeoJSON geometry are required. " +
        "labelPos defaults to bottom and is not MCP-writable. order is assigned on apply. " +
        "Relations use slugs from this payload, not IDs. " +
        patchSemantics,
      inputSchema: {
        projectSlug: z.string(),
      },
    },
    ({ projectSlug }) => runMcpTool(() => getSubsectionsSchemaForMcp(projectSlug)),
  )

  server.registerTool(
    "subsections_list",
    {
      description:
        `List subsections (Planungsabschnitte) for a project (default limit ${MCP_LIST_DEFAULT_LIMIT}, ` +
        `max ${MCP_LIST_MAX_LIMIT}). Requires mcpMode DRAFT or DIRECT. Response includes limit, returned, truncated. ` +
        "Requires projectSlug. Per row: projectSlug, slug, description, url — no geometry.",
      inputSchema: {
        projectSlug: z.string(),
        limit: mcpListLimitSchema,
      },
    },
    ({ projectSlug, limit }) =>
      runMcpTool(() => listSubsectionsForMcp({ projectSlug, origin, limit })),
  )

  server.registerTool(
    "subsections_update",
    {
      description:
        `Update one or more subsection (Planungsabschnitt) patches. Requires mcpMode DRAFT or DIRECT. Pass items (1–${MCP_LIST_MAX_LIMIT}). ` +
        "DRAFT writes McpDraft only. DIRECT writes Subsection immediately and removes the draft for that identity. " +
        "Identity is projectSlug + slug (PA Kürzel). Each item returns mode drafted or applied. " +
        patchSemantics,
      inputSchema: subsectionMcpUpdateInputSchema.shape,
    },
    (input) =>
      runMcpTool(() =>
        updateSubsectionForMcp({
          ...input,
          origin,
          createdById: auth.createdById,
        }),
      ),
  )

  server.registerTool(
    "subsections_create",
    {
      description:
        `Create subsection (Planungsabschnitt) records. Requires mcpMode DRAFT or DIRECT. Pass items (1–${MCP_LIST_MAX_LIMIT}). ` +
        "DRAFT writes McpDraft only. DIRECT writes Subsection immediately. " +
        "Each patch must include type (LINE|POLYGON) and matching GeoJSON geometry (WGS84 [lng, lat]). POINT is not allowed. " +
        "Incomplete items or slugs that already exist as a Planungsabschnitt are not written. " +
        "An existing create-draft for the same slug is last-wins upsert in DRAFT and removed after a DIRECT create. " +
        "Geometry in changes[].proposed is { type, vertexCount, bbox }, not coordinates. " +
        "Simplify geometries over 1000 vertices; more than 5000 is rejected. Each item returns mode drafted or applied. " +
        patchSemantics,
      inputSchema: subsectionMcpCreateInputSchema.shape,
    },
    (input) =>
      runMcpTool(() =>
        createSubsectionForMcp({
          ...input,
          origin,
          createdById: auth.createdById,
        }),
      ),
  )

  server.registerTool(
    "subsubsections_schema",
    {
      description:
        "Field metadata, extra field definitions, and lookup options for subsubsection (Maßnahme) updates and creates. Requires mcpMode DRAFT or DIRECT. " +
        "For updates, writable false for slug, geometry, type, subsectionId and other non-MCP fields. " +
        "For creates, slug is identity; type and GeoJSON geometry are required in the patch. labelPos defaults to bottom and is not MCP-writable. " +
        "Relations use slugs from this payload, not IDs. extraFields is Record<string,string>; keys are listed in extraFields. " +
        "Lookups return { id, slug, title }. Fixed enum location returns { slug, title } (no id). " +
        "Does not include labelPos, managers, operators, tags, survey, acquisition, or subsubsectionSpecials. " +
        patchSemantics,
      inputSchema: {
        projectSlug: z.string(),
      },
    },
    ({ projectSlug }) => runMcpTool(() => getSubsubsectionsSchemaForMcp(projectSlug)),
  )

  server.registerTool(
    "subsubsections_list",
    {
      description:
        `List subsubsections (Maßnahmen) for a project (default limit ${MCP_LIST_DEFAULT_LIMIT}, ` +
        `max ${MCP_LIST_MAX_LIMIT}). Requires mcpMode DRAFT or DIRECT. Response includes limit, returned, truncated. ` +
        "Requires projectSlug; optional subsectionSlug (Planungsabschnitt). Per row: projectSlug, subsectionSlug, slug (Maßnahme), " +
        "description, url — no extraFields or geometry. When subsectionSlug is set and returned > 1, disambiguationRequired is true.",
      inputSchema: {
        projectSlug: z.string(),
        subsectionSlug: z.string().optional().describe("Planungsabschnitt slug"),
        limit: mcpListLimitSchema,
      },
    },
    ({ projectSlug, subsectionSlug, limit }) =>
      runMcpTool(() => listSubsubsectionsForMcp({ projectSlug, subsectionSlug, origin, limit })),
  )

  server.registerTool(
    "subsubsections_update",
    {
      description:
        `Update one or more subsubsection (Maßnahme) patches. Requires mcpMode DRAFT or DIRECT. Pass items (1–${MCP_LIST_MAX_LIMIT}). ` +
        "DRAFT writes McpDraft only. DIRECT writes Subsubsection immediately and removes the draft for that identity. " +
        "Response lists url, mode, changes[].proposed, and overwrite warnings per item. " +
        patchSemantics,
      inputSchema: subsubsectionMcpUpdateInputSchema.shape,
    },
    (input) =>
      runMcpTool(() =>
        updateSubsubsectionForMcp({
          ...input,
          origin,
          createdById: auth.createdById,
        }),
      ),
  )

  server.registerTool(
    "subsubsections_create",
    {
      description:
        `Create subsubsection (Maßnahme) records. Requires mcpMode DRAFT or DIRECT. Pass items (1–${MCP_LIST_MAX_LIMIT}). ` +
        "DRAFT writes McpDraft only. DIRECT writes Subsubsection immediately. " +
        "Each patch must include type (POINT/LINE/POLYGON) and matching GeoJSON geometry (WGS84 [lng, lat]). " +
        "Incomplete items or slugs that already exist as a Maßnahme are not written; the response lists missingRequired and slugConflict. " +
        "An existing create-draft for the same slug is last-wins upsert in DRAFT and removed after a DIRECT create. " +
        "Geometry in changes[].proposed is { type, vertexCount, bbox }, not coordinates. " +
        "Simplify geometries over 1000 vertices; more than 5000 is rejected. Split large batches. Each item returns mode drafted or applied. " +
        patchSemantics,
      inputSchema: subsubsectionMcpCreateInputSchema.shape,
    },
    (input) =>
      runMcpTool(() =>
        createSubsubsectionForMcp({
          ...input,
          origin,
          createdById: auth.createdById,
        }),
      ),
  )

  server.registerTool(
    "subsections_delete",
    {
      description:
        `Delete subsections (Planungsabschnitte). Requires effective mcpMode DIRECT. Pass items (1–${MCP_LIST_MAX_LIMIT}). ` +
        "Without confirm, writes nothing and returns identity, url, and dependency counts. " +
        "With confirm true, deletes only when no Maßnahmen remain. Show the preview to the user before confirming.",
      inputSchema: subsectionMcpDeleteInputSchema.shape,
    },
    (input) =>
      runMcpTool(() =>
        deleteSubsectionForMcp({
          ...input,
          origin,
          createdById: auth.createdById,
        }),
      ),
  )

  server.registerTool(
    "subsubsections_delete",
    {
      description:
        `Delete subsubsections (Maßnahmen). Requires effective mcpMode DIRECT. Pass items (1–${MCP_LIST_MAX_LIMIT}). ` +
        "Without confirm, writes nothing and returns identity, url, projectRecordCount, uploadCount, and acquisitionAreaCount. " +
        "With confirm true, deletes only when those counts are zero. Show the preview to the user before confirming.",
      inputSchema: subsubsectionMcpDeleteInputSchema.shape,
    },
    (input) =>
      runMcpTool(() =>
        deleteSubsubsectionForMcp({
          ...input,
          origin,
          createdById: auth.createdById,
        }),
      ),
  )

  return server
}
