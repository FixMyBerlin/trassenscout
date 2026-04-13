import type { Prisma } from "@/db"

/**
 * Deletes deal areas matching `where`, then removes each parcel that no longer has deal areas.
 * Mirrors single-row behaviour in `deleteDealArea`.
 */
export async function deleteDealAreasAndOrphanParcels(
  tx: Prisma.TransactionClient,
  where: Prisma.DealAreaWhereInput,
): Promise<{ deletedDealAreas: number }> {
  const dealAreas = await tx.dealArea.findMany({
    where,
    select: { id: true, parcelId: true },
  })
  if (dealAreas.length === 0) {
    return { deletedDealAreas: 0 }
  }
  const ids = dealAreas.map((d) => d.id)
  await tx.dealArea.deleteMany({ where: { id: { in: ids } } })
  const parcelIds = [...new Set(dealAreas.map((d) => d.parcelId))]
  for (const parcelId of parcelIds) {
    const remaining = await tx.dealArea.count({ where: { parcelId } })
    if (remaining === 0) {
      await tx.parcel.delete({ where: { id: parcelId } })
    }
  }
  return { deletedDealAreas: dealAreas.length }
}
