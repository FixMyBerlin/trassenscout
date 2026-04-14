import type { Prisma } from "@/db"

/**
 * Deletes acquisition areas matching `where`, then removes each parcel that no longer has acquisition areas.
 * Mirrors single-row behaviour in `deleteAcquisitionArea`.
 */
export async function deleteAcquisitionAreasAndOrphanParcels(
  tx: Prisma.TransactionClient,
  where: Prisma.AcquisitionAreaWhereInput,
): Promise<{ deletedAcquisitionAreas: number }> {
  const acquisitionAreas = await tx.acquisitionArea.findMany({
    where,
    select: { id: true, parcelId: true },
  })
  if (acquisitionAreas.length === 0) {
    return { deletedAcquisitionAreas: 0 }
  }
  const ids = acquisitionAreas.map((d) => d.id)
  await tx.acquisitionArea.deleteMany({ where: { id: { in: ids } } })
  const parcelIds = [...new Set(acquisitionAreas.map((d) => d.parcelId))]
  for (const parcelId of parcelIds) {
    const remaining = await tx.acquisitionArea.count({ where: { parcelId } })
    if (remaining === 0) {
      await tx.parcel.delete({ where: { id: parcelId } })
    }
  }
  return { deletedAcquisitionAreas: acquisitionAreas.length }
}
