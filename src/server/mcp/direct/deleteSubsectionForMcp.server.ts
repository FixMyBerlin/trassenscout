import { frenchQuote } from "@/src/components/core/components/text/quote"
import { shortTitle } from "@/src/components/core/components/text/titles"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { requireMcpDirectProject } from "@/src/server/mcp/direct/requireMcpDirectProject.server"
import { mcpEnvLabel } from "@/src/server/mcp/mcpCursorConfig"
import { buildSubsectionUrl } from "@/src/server/mcp/subsectionUrl"
import {
  subsectionLogSnapshot,
  subsectionLogSnapshotSelect,
} from "@/src/server/subsections/subsectionLogSnapshot"

type SubsectionDeleteItem = {
  projectSlug: string
  slug: string
}

function lastWinsItems(items: SubsectionDeleteItem[]) {
  const map = new Map<string, SubsectionDeleteItem>()
  for (const item of items) {
    const key = `${item.projectSlug}\0${item.slug}`
    map.delete(key)
    map.set(key, item)
  }
  return [...map.values()]
}

export async function deleteSubsectionForMcp(input: {
  items: SubsectionDeleteItem[]
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

      const row = await db.subsection.findFirst({
        where: { slug: item.slug, projectId: project.id },
        select: {
          id: true,
          ...subsectionLogSnapshotSelect,
          _count: { select: { subsubsections: true } },
        },
      })
      if (!row) throw new Error(`Subsection (Planungsabschnitt) not found: ${item.slug}`)

      const url = buildSubsectionUrl(input.origin, project.slug, row.slug)
      const counts = {
        projectRecordCount: 0,
        uploadCount: 0,
        acquisitionAreaCount: 0,
        subsubsectionCount: row._count.subsubsections,
      }

      if (!input.confirm) {
        results.push({ ...item, url, ...counts, deleted: false, errors: [] })
        continue
      }

      if (counts.subsubsectionCount > 0) {
        results.push({
          ...item,
          url,
          ...counts,
          deleted: false,
          errors: [
            `Planungsabschnitt kann nicht gelöscht werden: ${counts.subsubsectionCount} Maßnahme(n) hängen noch daran.`,
          ],
        })
        continue
      }

      await db.subsection.delete({ where: { id: row.id } })
      await createLogEntry({
        action: "DELETE",
        message: `Planungsabschnitt ${frenchQuote(shortTitle(row.slug))} wurde gelöscht.`,
        userId: input.createdById,
        projectSlug: project.slug,
        previousRecord: { id: row.id, ...subsectionLogSnapshot(row) },
      })
      deletedCount += 1
      results.push({ ...item, url, ...counts, deleted: true, errors: [] })
    } catch (error) {
      results.push({
        ...item,
        url: null,
        projectRecordCount: 0,
        uploadCount: 0,
        acquisitionAreaCount: 0,
        subsubsectionCount: 0,
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
