import { frenchQuote } from "@/src/components/core/components/text/quote"
import { shortTitle } from "@/src/components/core/components/text/titles"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import type { FuehrungMcpPatch } from "@/src/server/mcp/fuehrungUpdate/patchSchema"
import {
  fuehrungPreviewPayload,
  resolveFuehrungUpdate,
} from "@/src/server/mcp/fuehrungUpdate/resolveFuehrungUpdate.server"
import {
  subsubsectionLogSnapshot,
  subsubsectionLogSnapshotSelect,
} from "@/src/server/subsubsections/subsubsectionLogSnapshot"

export async function previewFuehrungUpdateForMcp(input: {
  projectSlug: string
  subsectionSlug: string
  slug: string
  patch: FuehrungMcpPatch
  origin: string
}) {
  const resolved = await resolveFuehrungUpdate(input)
  return fuehrungPreviewPayload(resolved)
}

export async function updateFuehrungForMcp(input: {
  projectSlug: string
  subsectionSlug: string
  slug: string
  patch: FuehrungMcpPatch
  origin: string
  confirm: boolean
  createdById: number
}) {
  if (input.confirm !== true) {
    throw new Error(
      "fuehrungen_update requires confirm: true after fuehrungen_update_preview. MCP does not write without explicit confirmation.",
    )
  }

  // Preview and update each resolve the record independently (no preview token or etag).
  // A future improvement could require a hash or updatedAt from preview on write, so confirm
  // applies against the same snapshot the agent showed the user. Not implemented yet: migration
  // tooling tolerates re-resolve between preview and write, and we want to keep the API simple.
  const resolved = await resolveFuehrungUpdate(input)
  if (!resolved.okToWrite) {
    return { ...fuehrungPreviewPayload(resolved), written: false }
  }

  const record = await db.subsubsection.update({
    where: { id: resolved.fuehrungId },
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
    ...fuehrungPreviewPayload(resolved),
    written: true,
    slug: record.slug,
  }
}
