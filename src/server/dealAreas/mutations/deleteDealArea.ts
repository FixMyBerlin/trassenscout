import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { deleteDealAreasAndOrphanParcels } from "@/src/server/dealAreas/_utils/deleteDealAreasAndOrphanParcels"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const DeleteDealAreaSchema = ProjectSlugRequiredSchema.merge(z.object({ id: z.number() }))

export default resolver.pipe(
  resolver.zod(DeleteDealAreaSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug }) => {
    return await db.$transaction(async (tx) => {
      const dealArea = await tx.dealArea.findFirstOrThrow({
        where: {
          id,
          subsubsection: {
            subsection: {
              project: {
                slug: projectSlug,
              },
            },
          },
        },
        select: {
          id: true,
        },
      })

      await deleteDealAreasAndOrphanParcels(tx, { id: dealArea.id })

      return { count: 1 }
    })
  },
)
