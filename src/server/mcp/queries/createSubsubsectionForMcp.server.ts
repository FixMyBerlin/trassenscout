import { applySubsubsectionCreateForMcp } from "@/src/server/mcp/direct/applyMcpDirectWrite.server"
import { lastWinsItems } from "@/src/server/mcp/lastWinsItems"
import { mcpEnvLabel } from "@/src/server/mcp/mcpCursorConfig"
import { upsertSubsubsectionMcpCreateDraft } from "@/src/server/mcp/mcpDrafts/mcpDrafts.server"
import { mcpWriteFields, writeResolvedItem } from "@/src/server/mcp/mcpWriteMode"
import type { SubsubsectionMcpCreatePatch } from "@/src/server/mcp/subsubsectionUpdate/patchSchema"
import {
  resolveSubsubsectionCreate,
  subsubsectionCreatePreviewPayload,
} from "@/src/server/mcp/subsubsectionUpdate/resolveSubsubsectionCreate.server"

type SubsubsectionMcpCreateItem = {
  projectSlug: string
  subsectionSlug: string
  slug: string
  patch: SubsubsectionMcpCreatePatch
}

function identityFromItem(item: SubsubsectionMcpCreateItem) {
  return {
    projectSlug: item.projectSlug,
    subsectionSlug: item.subsectionSlug,
    slug: item.slug,
  }
}

async function resolveItem(item: SubsubsectionMcpCreateItem, origin: string) {
  try {
    return await resolveSubsubsectionCreate({ ...item, origin })
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function createSubsubsectionForMcp(input: {
  items: SubsubsectionMcpCreateItem[]
  origin: string
  createdById: number
}) {
  const items = lastWinsItems(input.items, (item) => [
    item.projectSlug,
    item.subsectionSlug,
    item.slug,
  ])
  const results = []
  let draftedCount = 0
  let appliedCount = 0

  for (const item of items) {
    const resolved = await resolveItem(item, input.origin)
    if ("error" in resolved) {
      results.push({
        ...identityFromItem(item),
        url: null,
        ...mcpWriteFields(null),
        changes: [],
        errors: [resolved.error],
        warnings: [],
        missingRequired: [],
        slugConflict: null,
      })
      continue
    }

    if (!resolved.okToWrite) {
      results.push({
        ...identityFromItem(item),
        ...subsubsectionCreatePreviewPayload(resolved),
        ...mcpWriteFields(null),
      })
      continue
    }

    const mode = await writeResolvedItem(resolved, {
      apply: () => applySubsubsectionCreateForMcp(resolved, input.createdById),
      draft: () =>
        upsertSubsubsectionMcpCreateDraft({
          createdById: input.createdById,
          projectId: resolved.projectId,
          parentSubsectionId: resolved.subsectionId,
          slug: resolved.slug,
          patch: item.patch,
        }),
    })
    if (mode === "applied") appliedCount += 1
    else draftedCount += 1

    results.push({
      ...identityFromItem(item),
      ...subsubsectionCreatePreviewPayload(resolved),
      ...mcpWriteFields(mode),
      errors: [],
    })
  }

  return {
    environment: mcpEnvLabel(process.env.VITE_APP_ENV),
    returned: results.length,
    draftedCount,
    appliedCount,
    items: results,
  }
}
