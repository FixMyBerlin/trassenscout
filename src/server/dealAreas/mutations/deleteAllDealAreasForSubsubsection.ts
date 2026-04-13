import db from "@/db"
import { deleteDealAreasAndOrphanParcels } from "@/src/server/dealAreas/_utils/deleteDealAreasAndOrphanParcels"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { z } from "zod"

const DeleteAllDealAreasForSubsubsectionSchema = z.object({
  projectSlug: z.string(),
  subsectionSlug: z.string(),
  subsubsectionSlug: z.string(),
})

export default resolver.pipe(
  resolver.zod(DeleteAllDealAreasForSubsubsectionSchema),
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

      const { deletedDealAreas } = await deleteDealAreasAndOrphanParcels(tx, {
        subsubsectionId: subsubsection.id,
      })

      return { deletedDealAreas }
    })
  },
)
