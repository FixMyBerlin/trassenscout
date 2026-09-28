import { applySubsubsectionUpdateForMcp } from "@/src/server/mcp/direct/applyMcpDirectWrite.server"
import { mcpEnvLabel } from "@/src/server/mcp/mcpCursorConfig"
import { upsertSubsubsectionMcpDraft } from "@/src/server/mcp/mcpDrafts/mcpDrafts.server"
import { mcpWriteFields, writeResolvedItem } from "@/src/server/mcp/mcpWriteMode"
import type { SubsubsectionMcpPatch } from "@/src/server/mcp/subsubsectionUpdate/patchSchema"
import {
  resolveSubsubsectionUpdate,
  subsubsectionPreviewPayload,
} from "@/src/server/mcp/subsubsectionUpdate/resolveSubsubsectionUpdate.server"

type SubsubsectionMcpIdentityItem = {
  projectSlug: string
  subsectionSlug: string
  slug: string
  patch: SubsubsectionMcpPatch
}

function lastWinsItems(items: SubsubsectionMcpIdentityItem[]) {
  const map = new Map<string, SubsubsectionMcpIdentityItem>()
  for (const item of items) {
    const key = `${item.projectSlug}\0${item.subsectionSlug}\0${item.slug}`
    map.delete(key)
    map.set(key, item)
  }
  return [...map.values()]
}

function identityFromItem(item: SubsubsectionMcpIdentityItem) {
  return {
    projectSlug: item.projectSlug,
    subsectionSlug: item.subsectionSlug,
    slug: item.slug,
  }
}

async function resolveItem(item: SubsubsectionMcpIdentityItem, origin: string) {
  try {
    return await resolveSubsubsectionUpdate({ ...item, origin })
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function updateSubsubsectionForMcp(input: {
  items: SubsubsectionMcpIdentityItem[]
  origin: string
  createdById: number
}) {
  const items = lastWinsItems(input.items)
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
      })
      continue
    }

    if (!resolved.okToWrite) {
      results.push({
        ...identityFromItem(item),
        ...subsubsectionPreviewPayload(resolved),
        ...mcpWriteFields(null),
        errors: resolved.errors.length > 0 ? resolved.errors : ["Patch is empty or unchanged."],
      })
      continue
    }

    const mode = await writeResolvedItem(resolved, {
      apply: () => applySubsubsectionUpdateForMcp(resolved, input.createdById),
      draft: () =>
        upsertSubsubsectionMcpDraft({
          createdById: input.createdById,
          projectId: resolved.projectId,
          subsubsectionId: resolved.subsubsectionId,
          patch: item.patch,
        }),
    })
    if (mode === "applied") appliedCount += 1
    else draftedCount += 1

    results.push({
      ...identityFromItem(item),
      ...subsubsectionPreviewPayload(resolved),
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
