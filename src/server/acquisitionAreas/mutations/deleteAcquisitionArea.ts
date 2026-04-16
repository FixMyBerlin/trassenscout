import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { deleteAcquisitionAreasAndOrphanParcels } from "@/src/server/acquisitionAreas/_utils/deleteAcquisitionAreasAndOrphanParcels"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const DeleteAcquisitionAreaSchema = ProjectSlugRequiredSchema.merge(z.object({ id: z.number() }))

export default resolver.pipe(
  resolver.zod(DeleteAcquisitionAreaSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug }, ctx: Ctx) => {
    const result = await db.$transaction(async (tx) => {
      const acquisitionArea = await tx.acquisitionArea.findFirstOrThrow({
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
          acquisitionAreaStatusId: true,
        },
      })

      await deleteAcquisitionAreasAndOrphanParcels(tx, { id: acquisitionArea.id })

      return { count: 1, deletedAcquisitionArea: acquisitionArea }
    })

    await createLogEntry({
      action: "DELETE",
      message: `Erwerbsfläche ${result.deletedAcquisitionArea.id} gelöscht`,
      userId: ctx.session.userId,
      projectSlug,
    })

    return { count: result.count }
  },
)
