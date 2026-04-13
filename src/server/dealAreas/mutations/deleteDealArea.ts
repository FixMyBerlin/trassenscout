import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { deleteDealAreasAndOrphanParcels } from "@/src/server/dealAreas/_utils/deleteDealAreasAndOrphanParcels"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const DeleteDealAreaSchema = ProjectSlugRequiredSchema.merge(z.object({ id: z.number() }))

export default resolver.pipe(
  resolver.zod(DeleteDealAreaSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug }, ctx: Ctx) => {
    const result = await db.$transaction(async (tx) => {
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
          subsubsectionId: true,
          parcelId: true,
          geometry: true,
          description: true,
          dealAreaStatusId: true,
        },
      })

      await deleteDealAreasAndOrphanParcels(tx, { id: dealArea.id })

      return { count: 1, deletedDealArea: dealArea }
    })

    await createLogEntry({
      action: "DELETE",
      message: `Erwerbsfläche ${result.deletedDealArea.id} gelöscht`,
      userId: ctx.session.userId,
      projectSlug,
    })

    return { count: result.count }
  },
)
