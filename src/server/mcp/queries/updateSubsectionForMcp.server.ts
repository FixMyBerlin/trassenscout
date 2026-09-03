import { mcpEnvLabel } from "@/src/server/mcp/mcpCursorConfig"
import { upsertSubsectionMcpDraft } from "@/src/server/mcp/mcpDrafts/mcpDrafts.server"
import type { SubsectionMcpPatch } from "@/src/server/mcp/subsectionUpdate/patchSchema"
import {
  resolveSubsectionUpdate,
  subsectionPreviewPayload,
} from "@/src/server/mcp/subsectionUpdate/resolveSubsectionUpdate.server"

type SubsectionMcpIdentityItem = {
  projectSlug: string
  slug: string
  patch: SubsectionMcpPatch
}

function lastWinsItems(items: SubsectionMcpIdentityItem[]) {
  const map = new Map<string, SubsectionMcpIdentityItem>()
  for (const item of items) {
    const key = `${item.projectSlug}\0${item.slug}`
    map.delete(key)
    map.set(key, item)
  }
  return [...map.values()]
}

function identityFromItem(item: SubsectionMcpIdentityItem) {
  return {
    projectSlug: item.projectSlug,
    slug: item.slug,
  }
}

async function resolveItem(item: SubsectionMcpIdentityItem, origin: string) {
  try {
    return await resolveSubsectionUpdate({ ...item, origin })
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function updateSubsectionForMcp(input: {
  items: SubsectionMcpIdentityItem[]
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
        ...subsectionPreviewPayload(resolved),
        drafted: false,
        errors: resolved.errors.length > 0 ? resolved.errors : ["Patch is empty or unchanged."],
      })
      continue
    }

    await upsertSubsectionMcpDraft({
      createdById: input.createdById,
      projectId: resolved.projectId,
      subsectionId: resolved.subsectionId,
      patch: item.patch,
    })

    draftedCount += 1
    results.push({
      ...identityFromItem(item),
      ...subsectionPreviewPayload(resolved),
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
