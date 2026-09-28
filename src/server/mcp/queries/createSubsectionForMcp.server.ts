import { applySubsectionCreateForMcp } from "@/src/server/mcp/direct/applyMcpDirectWrite.server"
import { mcpEnvLabel } from "@/src/server/mcp/mcpCursorConfig"
import { upsertSubsectionMcpCreateDraft } from "@/src/server/mcp/mcpDrafts/mcpDrafts.server"
import { mcpWriteFields, writeResolvedItem } from "@/src/server/mcp/mcpWriteMode"
import type { SubsectionMcpCreatePatch } from "@/src/server/mcp/subsectionUpdate/patchSchema"
import {
  resolveSubsectionCreate,
  subsectionCreatePreviewPayload,
} from "@/src/server/mcp/subsectionUpdate/resolveSubsectionCreate.server"

type SubsectionMcpCreateItem = {
  projectSlug: string
  slug: string
  patch: SubsectionMcpCreatePatch
}

function lastWinsItems(items: SubsectionMcpCreateItem[]) {
  const map = new Map<string, SubsectionMcpCreateItem>()
  for (const item of items) {
    const key = `${item.projectSlug}\0${item.slug}`
    map.delete(key)
    map.set(key, item)
  }
  return [...map.values()]
}

function identityFromItem(item: SubsectionMcpCreateItem) {
  return {
    projectSlug: item.projectSlug,
    slug: item.slug,
  }
}

async function resolveItem(item: SubsectionMcpCreateItem, origin: string) {
  try {
    return await resolveSubsectionCreate({ ...item, origin })
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function createSubsectionForMcp(input: {
  items: SubsectionMcpCreateItem[]
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
        missingRequired: [],
        slugConflict: null,
      })
      continue
    }

    if (!resolved.okToWrite) {
      results.push({
        ...identityFromItem(item),
        ...subsectionCreatePreviewPayload(resolved),
        ...mcpWriteFields(null),
      })
      continue
    }

    const mode = await writeResolvedItem(resolved, {
      apply: () => applySubsectionCreateForMcp(resolved, input.createdById),
      draft: () =>
        upsertSubsectionMcpCreateDraft({
          createdById: input.createdById,
          projectId: resolved.projectId,
          slug: resolved.slug,
          patch: item.patch,
        }),
    })
    if (mode === "applied") appliedCount += 1
    else draftedCount += 1

    results.push({
      ...identityFromItem(item),
      ...subsectionCreatePreviewPayload(resolved),
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
