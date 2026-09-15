import { mcpEnvLabel } from "@/src/server/mcp/mcpCursorConfig"
import { upsertSubsubsectionMcpDraft } from "@/src/server/mcp/mcpDrafts/mcpDrafts.server"
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
      })
      continue
    }

    if (!resolved.okToWrite) {
      results.push({
        ...identityFromItem(item),
        ...subsubsectionPreviewPayload(resolved),
        drafted: false,
        errors: resolved.errors.length > 0 ? resolved.errors : ["Patch is empty or unchanged."],
      })
      continue
    }

    await upsertSubsubsectionMcpDraft({
      createdById: input.createdById,
      projectId: resolved.projectId,
      subsubsectionId: resolved.subsubsectionId,
      patch: item.patch,
    })

    draftedCount += 1
    results.push({
      ...identityFromItem(item),
      ...subsubsectionPreviewPayload(resolved),
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
