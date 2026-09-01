import type { Prisma } from "@/src/prisma/generated/browser"
import db from "@/src/server/db.server"

export async function cleanupBeforeMembershipDelete({
  projectId,
  userId,
  client = db,
}: {
  membershipId: number
  projectId: number
  userId: number
  client?: Prisma.TransactionClient
}) {
  await Promise.all([
    client.projectRecord.updateMany({
      where: { projectId, assignedToId: userId },
      data: { assignedToId: null },
    }),
    client.subsection.updateMany({
      where: { projectId, managerId: userId },
      data: { managerId: null },
    }),
    client.subsubsection.updateMany({
      where: { managerId: userId, subsection: { projectId } },
      data: { managerId: null },
    }),
  ])
}
