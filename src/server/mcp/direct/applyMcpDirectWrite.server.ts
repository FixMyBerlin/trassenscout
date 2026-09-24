import { frenchQuote } from "@/src/components/core/components/text/quote"
import { shortTitle } from "@/src/components/core/components/text/titles"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { assertMcpDirect } from "@/src/server/mcp/direct/requireMcpDirectProject.server"
import {
  deleteSubsectionMcpCreateDraftBySlug,
  deleteSubsubsectionMcpCreateDraftBySlug,
} from "@/src/server/mcp/mcpDrafts/mcpDrafts.server"
import type { ResolveSubsectionCreateResult } from "@/src/server/mcp/subsectionUpdate/resolveSubsectionCreate.server"
import type { ResolveSubsectionUpdateResult } from "@/src/server/mcp/subsectionUpdate/resolveSubsectionUpdate.server"
import type { ResolveSubsubsectionCreateResult } from "@/src/server/mcp/subsubsectionUpdate/resolveSubsubsectionCreate.server"
import type { ResolveSubsubsectionUpdateResult } from "@/src/server/mcp/subsubsectionUpdate/resolveSubsubsectionUpdate.server"
import {
  subsectionLogSnapshot,
  subsectionLogSnapshotSelect,
} from "@/src/server/subsections/subsectionLogSnapshot"
import {
  subsubsectionLogSnapshot,
  subsubsectionLogSnapshotSelect,
} from "@/src/server/subsubsections/subsubsectionLogSnapshot"

export async function applySubsubsectionUpdateForMcp(
  resolved: ResolveSubsubsectionUpdateResult,
  createdById: number,
) {
  assertMcpDirect(resolved)
  const record = await db.subsubsection.update({
    where: { id: resolved.subsubsectionId },
    data: resolved.prismaData,
    select: { id: true, ...subsubsectionLogSnapshotSelect },
  })

  await db.mcpDraft.deleteMany({ where: { subsubsectionId: record.id } })

  await createLogEntry({
    action: "UPDATE",
    message: `Maßnahme ${frenchQuote(shortTitle(record.slug))} wurde bearbeitet.`,
    userId: createdById,
    projectSlug: resolved.projectSlug,
    subsubsectionId: record.id,
    previousRecord: resolved.previousSnapshot,
    updatedRecord: { id: record.id, ...subsubsectionLogSnapshot(record) },
  })
}

export async function applySubsubsectionCreateForMcp(
  resolved: ResolveSubsubsectionCreateResult,
  createdById: number,
) {
  assertMcpDirect(resolved)
  const record = await db.subsubsection.create({
    data: resolved.prismaData,
    select: { id: true, ...subsubsectionLogSnapshotSelect },
  })

  await deleteSubsubsectionMcpCreateDraftBySlug(record.subsectionId, record.slug)

  await createLogEntry({
    action: "CREATE",
    message: `Neue Maßnahme ${frenchQuote(shortTitle(record.slug))} wurde erstellt.`,
    userId: createdById,
    projectSlug: resolved.projectSlug,
    subsubsectionId: record.id,
    updatedRecord: { id: record.id, ...subsubsectionLogSnapshot(record) },
  })
}

export async function applySubsectionUpdateForMcp(
  resolved: ResolveSubsectionUpdateResult,
  createdById: number,
) {
  assertMcpDirect(resolved)
  const previous = await db.subsection.findFirstOrThrow({
    where: { id: resolved.subsectionId },
    select: { id: true, ...subsectionLogSnapshotSelect },
  })
  const record = await db.subsection.update({
    where: { id: previous.id },
    data: resolved.prismaData,
    select: { id: true, ...subsectionLogSnapshotSelect },
  })

  await db.mcpDraft.deleteMany({ where: { subsectionId: record.id } })

  await createLogEntry({
    action: "UPDATE",
    message: `Planungsabschnitt ${frenchQuote(shortTitle(record.slug))} wurde bearbeitet.`,
    userId: createdById,
    projectSlug: resolved.projectSlug,
    subsectionId: record.id,
    previousRecord: { id: previous.id, ...subsectionLogSnapshot(previous) },
    updatedRecord: { id: record.id, ...subsectionLogSnapshot(record) },
  })
}

export async function applySubsectionCreateForMcp(
  resolved: ResolveSubsectionCreateResult,
  createdById: number,
) {
  assertMcpDirect(resolved)
  const maxOrder = await db.subsection.aggregate({
    _max: { order: true },
    where: { projectId: resolved.projectId },
  })
  const record = await db.subsection.create({
    data: { ...resolved.prismaData, order: (maxOrder._max.order ?? 0) + 1 },
    select: { id: true, projectId: true, ...subsectionLogSnapshotSelect },
  })

  await deleteSubsectionMcpCreateDraftBySlug(record.projectId, record.slug)

  await createLogEntry({
    action: "CREATE",
    message: `Neuer Planungsabschnitt ${frenchQuote(shortTitle(record.slug))} wurde erstellt.`,
    userId: createdById,
    projectSlug: resolved.projectSlug,
    subsectionId: record.id,
    updatedRecord: { id: record.id, ...subsectionLogSnapshot(record) },
  })
}
