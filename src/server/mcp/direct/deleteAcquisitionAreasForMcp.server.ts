import { frenchQuote } from "@/src/components/core/components/text/quote"
import { shortTitle } from "@/src/components/core/components/text/titles"
import type { Prisma } from "@/src/prisma/generated/browser"
import { deleteAcquisitionAreasAndOrphanParcels } from "@/src/server/acquisitionAreas/_utils/deleteAcquisitionAreasAndOrphanParcels"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { requireMcpDirectProject } from "@/src/server/mcp/direct/requireMcpDirectProject.server"
import { lastWinsItems } from "@/src/server/mcp/lastWinsItems"
import { mcpEnvLabel } from "@/src/server/mcp/mcpCursorConfig"
import { buildSubsubsectionUrl } from "@/src/server/mcp/subsubsectionUrl"

type AcquisitionAreasDeleteItem = {
  projectSlug: string
  subsectionSlug: string
  slug: string
}

// Deleting an area cascades to the Protokolle attached to it and unlinks Uploads, so those block it
const linkedWhere = {
  OR: [
    { projectRecords: { some: {} } },
    { projectRecordRelations: { some: {} } },
    { uploads: { some: {} } },
  ],
}

// Row locks make a concurrent link to these areas wait and then fail on the foreign key,
// so nothing can get attached between the check and the delete
async function lockAcquisitionAreaIds(tx: Prisma.TransactionClient, subsubsectionId: number) {
  const rows = await tx.$queryRaw<{ id: number }[]>`
    SELECT id FROM "AcquisitionArea" WHERE "subsubsectionId" = ${subsubsectionId} FOR UPDATE`
  return rows.map((r) => r.id)
}

function blockedReason(linkedAreaCount: number) {
  if (linkedAreaCount === 0) return null
  return `Grunderwerbsflächen können nicht gelöscht werden: ${linkedAreaCount} Fläche(n) mit Protokollen oder Uploads.`
}

export async function deleteAcquisitionAreasForMcp(input: {
  items: AcquisitionAreasDeleteItem[]
  confirm?: boolean
  origin: string
  createdById: number
}) {
  const items = lastWinsItems(input.items, (item) => [
    item.projectSlug,
    item.subsectionSlug,
    item.slug,
  ])
  const results = []
  let deletedAcquisitionAreaCount = 0

  for (const item of items) {
    try {
      const project = await requireMcpDirectProject(
        item.projectSlug,
        undefined,
        "Deleting acquisition areas",
      )

      const row = await db.subsubsection.findFirst({
        where: {
          slug: item.slug,
          subsection: { slug: item.subsectionSlug, projectId: project.id },
        },
        select: { id: true, slug: true },
      })
      if (!row) throw new Error(`Subsubsection (Maßnahme) not found: ${item.slug}`)

      const url = buildSubsubsectionUrl(input.origin, project.slug, item.subsectionSlug, row.slug)

      if (!input.confirm) {
        const [acquisitionAreaCount, linkedAcquisitionAreaCount] = await Promise.all([
          db.acquisitionArea.count({ where: { subsubsectionId: row.id } }),
          db.acquisitionArea.count({ where: { subsubsectionId: row.id, ...linkedWhere } }),
        ])
        results.push({
          ...item,
          url,
          acquisitionAreaCount,
          linkedAcquisitionAreaCount,
          deletedAcquisitionAreaCount: 0,
          errors: [],
        })
        continue
      }

      const outcome = await db.$transaction(async (tx) => {
        const ids = await lockAcquisitionAreaIds(tx, row.id)
        const linkedAcquisitionAreaCount = await tx.acquisitionArea.count({
          where: { id: { in: ids }, ...linkedWhere },
        })
        const counts = { acquisitionAreaCount: ids.length, linkedAcquisitionAreaCount }
        if (linkedAcquisitionAreaCount > 0) return { counts, deletedAreas: [] }

        const deletedAreas = await tx.acquisitionArea.findMany({
          where: { id: { in: ids } },
          select: { id: true, description: true, parcel: { select: { alkisParcelId: true } } },
          orderBy: { id: "asc" },
        })
        await deleteAcquisitionAreasAndOrphanParcels(tx, { id: { in: ids } })
        return { counts, deletedAreas }
      })

      const reason = blockedReason(outcome.counts.linkedAcquisitionAreaCount)
      if (reason) {
        results.push({
          ...item,
          url,
          ...outcome.counts,
          deletedAcquisitionAreaCount: 0,
          errors: [reason],
        })
        continue
      }

      const deletedAcquisitionAreas = outcome.deletedAreas.length
      if (deletedAcquisitionAreas > 0) {
        await createLogEntry({
          action: "DELETE",
          message: `${deletedAcquisitionAreas} Erwerbsfläche(n) der Maßnahme ${frenchQuote(shortTitle(row.slug))} wurden gelöscht.`,
          userId: input.createdById,
          projectSlug: project.slug,
          subsubsectionId: row.id,
          previousRecord: {
            acquisitionAreas: outcome.deletedAreas.map((a) => ({
              id: a.id,
              alkisParcelId: a.parcel.alkisParcelId,
              description: a.description,
            })),
          },
        })
      }
      deletedAcquisitionAreaCount += deletedAcquisitionAreas
      results.push({
        ...item,
        url,
        ...outcome.counts,
        deletedAcquisitionAreaCount: deletedAcquisitionAreas,
        errors: [],
      })
    } catch (error) {
      results.push({
        ...item,
        url: null,
        acquisitionAreaCount: 0,
        linkedAcquisitionAreaCount: 0,
        deletedAcquisitionAreaCount: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      })
    }
  }

  return {
    environment: mcpEnvLabel(process.env.VITE_APP_ENV),
    confirm: input.confirm === true,
    returned: results.length,
    deletedAcquisitionAreaCount,
    items: results,
  }
}
