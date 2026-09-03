import { mcpEnvLabel } from "@/src/server/mcp/mcpCursorConfig"
import { upsertSubsubsectionMcpCreateDraft } from "@/src/server/mcp/mcpDrafts/mcpDrafts.server"
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

function lastWinsItems(items: SubsubsectionMcpCreateItem[]) {
  const map = new Map<string, SubsubsectionMcpCreateItem>()
  for (const item of items) {
    const key = `${item.projectSlug}\0${item.subsectionSlug}\0${item.slug}`
    map.delete(key)
    map.set(key, item)
  }
  return [...map.values()]
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
  const items = lastWinsItems(input.items)
  const results = []
  let draftedCount = 0

  for (const item of items) {
    const resolved = await resolveItem(item, input.origin)
    if ("error" in resolved) {
      results.push({
        ...identityFromItem(item),
        url: null,
        drafted: false,
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
        drafted: false,
      })
      continue
    }

    await upsertSubsubsectionMcpCreateDraft({
      createdById: input.createdById,
      projectId: resolved.projectId,
      subsectionId: resolved.subsectionId,
      slug: resolved.slug,
      patch: item.patch,
    })

    draftedCount += 1
    results.push({
      ...identityFromItem(item),
      ...subsubsectionCreatePreviewPayload(resolved),
      drafted: true,
      errors: [],
    })
  }

  return {
    environment: mcpEnvLabel(process.env.VITE_APP_ENV),
    returned: results.length,
    draftedCount,
    items: results,
  }
}
