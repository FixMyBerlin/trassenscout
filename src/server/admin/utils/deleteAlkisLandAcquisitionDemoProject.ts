import type { Prisma } from "@/db"
import { deleteAcquisitionAreasAndOrphanParcels } from "@/src/server/acquisitionAreas/_utils/deleteAcquisitionAreasAndOrphanParcels"

/**
 * Removes one demo project and all rows that reference it (RESTRICT FK order).
 * Assumes the project is only used as an ALKIS land-acquisition demo; destructive.
 */
export async function deleteAlkisLandAcquisitionDemoProject(
  tx: Prisma.TransactionClient,
  projectId: number,
): Promise<void> {
  await tx.systemLogEntry.deleteMany({ where: { projectId } })

  await tx.surveyResponse.deleteMany({
    where: {
      surveySession: {
        survey: { projectId },
      },
    },
  })
  await tx.surveySession.deleteMany({
    where: { survey: { projectId } },
  })
  await tx.survey.deleteMany({ where: { projectId } })
  await tx.surveyResponseTopic.deleteMany({ where: { projectId } })

  await tx.invite.deleteMany({ where: { projectId } })
  await tx.contact.deleteMany({ where: { projectId } })

  await deleteAcquisitionAreasAndOrphanParcels(tx, {
    subsubsection: { subsection: { projectId } },
  })

  await tx.subsubsection.deleteMany({
    where: { subsection: { projectId } },
  })
  await tx.subsection.deleteMany({ where: { projectId } })

  await tx.networkHierarchy.deleteMany({ where: { projectId } })
  await tx.acquisitionAreaStatus.deleteMany({ where: { projectId } })
  await tx.qualityLevel.deleteMany({ where: { projectId } })
  await tx.subsubsectionStatus.deleteMany({ where: { projectId } })
  await tx.subsubsectionTask.deleteMany({ where: { projectId } })
  await tx.subsubsectionInfra.deleteMany({ where: { projectId } })
  await tx.subsubsectionInfrastructureType.deleteMany({ where: { projectId } })
  await tx.subsubsectionSpecial.deleteMany({ where: { projectId } })
  await tx.subsectionStatus.deleteMany({ where: { projectId } })

  await tx.operator.deleteMany({ where: { projectId } })
  await tx.membership.deleteMany({ where: { projectId } })

  await tx.project.delete({ where: { id: projectId } })
}
