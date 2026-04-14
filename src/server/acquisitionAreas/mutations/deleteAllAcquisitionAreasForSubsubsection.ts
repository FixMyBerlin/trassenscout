import db from "@/db"
import { deleteAcquisitionAreasAndOrphanParcels } from "@/src/server/acquisitionAreas/_utils/deleteAcquisitionAreasAndOrphanParcels"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { z } from "zod"

const DeleteAllAcquisitionAreasForSubsubsectionSchema = z.object({
  projectSlug: z.string(),
  subsectionSlug: z.string(),
  subsubsectionSlug: z.string(),
})

export default resolver.pipe(
  resolver.zod(DeleteAllAcquisitionAreasForSubsubsectionSchema),
  resolver.authorize("ADMIN"),
  async ({ projectSlug, subsectionSlug, subsubsectionSlug }) => {
    return await db.$transaction(async (tx) => {
      const subsubsection = await tx.subsubsection.findFirst({
        where: {
          slug: subsubsectionSlug,
          subsection: {
            slug: subsectionSlug,
            project: { slug: projectSlug },
          },
        },
        select: { id: true },
      })
      if (!subsubsection) {
        throw new NotFoundError()
      }

      const { deletedAcquisitionAreas } = await deleteAcquisitionAreasAndOrphanParcels(tx, {
        subsubsectionId: subsubsection.id,
      })

      return { deletedAcquisitionAreas }
    })
  },
)
