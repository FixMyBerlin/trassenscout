import { frenchQuote } from "@/src/components/core/components/text/quote"
import { shortTitle } from "@/src/components/core/components/text/titles"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { requireMcpDirectProject } from "@/src/server/mcp/direct/requireMcpDirectProject.server"
import { mcpEnvLabel } from "@/src/server/mcp/mcpCursorConfig"
import { buildSubsubsectionUrl } from "@/src/server/mcp/subsubsectionUrl"
import {
  subsubsectionLogSnapshot,
  subsubsectionLogSnapshotSelect,
} from "@/src/server/subsubsections/subsubsectionLogSnapshot"

type SubsubsectionDeleteItem = {
  projectSlug: string
  subsectionSlug: string
  slug: string
}

function lastWinsItems(items: SubsubsectionDeleteItem[]) {
  const map = new Map<string, SubsubsectionDeleteItem>()
  for (const item of items) {
    const key = `${item.projectSlug}\0${item.subsectionSlug}\0${item.slug}`
    map.delete(key)
    map.set(key, item)
  }
  return [...map.values()]
}

const dependencySelect = {
  id: true,
  ...subsubsectionLogSnapshotSelect,
  _count: {
    select: {
      projectRecords: true,
      uploads: true,
      acquisitionAreas: true,
    },
  },
} as const

function dependencyCounts(row: {
  _count: { projectRecords: number; uploads: number; acquisitionAreas: number }
}) {
  return {
    projectRecordCount: row._count.projectRecords,
    uploadCount: row._count.uploads,
    acquisitionAreaCount: row._count.acquisitionAreas,
  }
}

function blockedReason(counts: ReturnType<typeof dependencyCounts>) {
  const reasons: string[] = []
  if (counts.projectRecordCount > 0) {
    reasons.push(`${counts.projectRecordCount} Protokoll(e)`)
  }
  if (counts.uploadCount > 0) reasons.push(`${counts.uploadCount} Upload(s)`)
  if (counts.acquisitionAreaCount > 0) {
    reasons.push(`${counts.acquisitionAreaCount} Grunderwerbsfläche(n)`)
  }
  if (reasons.length === 0) return null
  return `Maßnahme kann nicht gelöscht werden: ${reasons.join(", ")}.`
}

export async function deleteSubsubsectionForMcp(input: {
  items: SubsubsectionDeleteItem[]
  confirm?: boolean
  origin: string
  createdById: number
}) {
  const items = lastWinsItems(input.items)
  const results = []
  let deletedCount = 0

  for (const item of items) {
    try {
      const project = await requireMcpDirectProject(item.projectSlug)

      const row = await db.subsubsection.findFirst({
        where: {
          slug: item.slug,
          subsection: { slug: item.subsectionSlug, projectId: project.id },
        },
        select: dependencySelect,
      })
      if (!row) throw new Error(`Subsubsection (Maßnahme) not found: ${item.slug}`)

      const url = buildSubsubsectionUrl(input.origin, project.slug, item.subsectionSlug, row.slug)
      const counts = dependencyCounts(row)
      const reason = blockedReason(counts)

      if (!input.confirm) {
        results.push({
          ...item,
          url,
          ...counts,
          deleted: false,
          errors: [],
        })
        continue
      }

      if (reason) {
        results.push({
          ...item,
          url,
          ...counts,
          deleted: false,
          errors: [reason],
        })
        continue
      }

      await db.subsubsection.delete({ where: { id: row.id } })
      await createLogEntry({
        action: "DELETE",
        message: `Maßnahme ${frenchQuote(shortTitle(row.slug))} wurde gelöscht.`,
        userId: input.createdById,
        projectSlug: project.slug,
        previousRecord: { id: row.id, ...subsubsectionLogSnapshot(row) },
      })
      deletedCount += 1
      results.push({
        ...item,
        url,
        ...counts,
        deleted: true,
        errors: [],
      })
    } catch (error) {
      results.push({
        ...item,
        url: null,
        projectRecordCount: 0,
        uploadCount: 0,
        acquisitionAreaCount: 0,
        deleted: false,
        errors: [error instanceof Error ? error.message : String(error)],
      })
    }
  }

  return {
    environment: mcpEnvLabel(process.env.VITE_APP_ENV),
    confirm: input.confirm === true,
    returned: results.length,
    deletedCount,
    items: results,
  }
}
