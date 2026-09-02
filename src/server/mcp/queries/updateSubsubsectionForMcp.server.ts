import { frenchQuote } from "@/src/components/core/components/text/quote"
import { shortTitle } from "@/src/components/core/components/text/titles"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import type { SubsubsectionMcpPatch } from "@/src/server/mcp/subsubsectionUpdate/patchSchema"
import {
  resolveSubsubsectionUpdate,
  subsubsectionPreviewPayload,
} from "@/src/server/mcp/subsubsectionUpdate/resolveSubsubsectionUpdate.server"
import {
  subsubsectionLogSnapshot,
  subsubsectionLogSnapshotSelect,
} from "@/src/server/subsubsections/subsubsectionLogSnapshot"

export async function previewSubsubsectionUpdateForMcp(input: {
  projectSlug: string
  subsectionSlug: string
  slug: string
  patch: SubsubsectionMcpPatch
  origin: string
}) {
  const resolved = await resolveSubsubsectionUpdate(input)
  return subsubsectionPreviewPayload(resolved)
}

export async function updateSubsubsectionForMcp(input: {
  projectSlug: string
  subsectionSlug: string
  slug: string
  patch: SubsubsectionMcpPatch
  origin: string
  confirm: boolean
  createdById: number
}) {
  if (input.confirm !== true) {
    throw new Error(
      "subsubsections_update requires confirm: true after subsubsections_update_preview. MCP does not write without explicit confirmation.",
    )
  }

  // Preview and update each resolve the record independently (no preview token or etag).
  // A future improvement could require a hash or updatedAt from preview on write, so confirm
  // applies against the same snapshot the agent showed the user. Not implemented yet: migration
  // tooling tolerates re-resolve between preview and write, and we want to keep the API simple.
  const resolved = await resolveSubsubsectionUpdate(input)
  if (!resolved.okToWrite) {
    return { ...subsubsectionPreviewPayload(resolved), written: false }
  }

  const record = await db.subsubsection.update({
    where: { id: resolved.subsubsectionId },
    data: resolved.prismaData,
    select: { id: true, ...subsubsectionLogSnapshotSelect },
  })

  await createLogEntry({
    action: "UPDATE",
    message: `Maßnahme ${frenchQuote(shortTitle(record.slug))} wurde bearbeitet.`,
    userId: input.createdById,
    projectSlug: resolved.projectSlug,
    subsubsectionId: record.id,
    previousRecord: resolved.previousSnapshot,
    updatedRecord: { id: record.id, ...subsubsectionLogSnapshot(record) },
  })

  return {
    ...subsubsectionPreviewPayload(resolved),
    written: true,
    slug: record.slug,
  }
}
