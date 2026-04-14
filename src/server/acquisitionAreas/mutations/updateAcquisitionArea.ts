import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { validateAcquisitionAreaInput } from "../_utils/validateAcquisitionAreaInput"
import { AcquisitionAreaSchema } from "../schema"
import { typeAcquisitionAreaGeometry } from "../utils/typeAcquisitionAreaGeometry"

const UpdateAcquisitionAreaSchema = ProjectSlugRequiredSchema.merge(
  AcquisitionAreaSchema.merge(z.object({ id: z.number() })),
)

export default resolver.pipe(
  resolver.zod(UpdateAcquisitionAreaSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug, ...data }, ctx: Ctx) => {
    const previous = await db.acquisitionArea.findFirstOrThrow({
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

    await validateAcquisitionAreaInput({
      projectSlug,
      subsubsectionId: data.subsubsectionId,
      parcelId: data.parcelId,
      acquisitionAreaStatusId: data.acquisitionAreaStatusId,
    })

    const acquisitionArea = await db.acquisitionArea.update({
      where: { id },
      data: {
        ...data,
        acquisitionAreaStatusId: data.acquisitionAreaStatusId ?? null,
      },
    })

    await createLogEntry({
      action: "UPDATE",
      message: `Erwerbsfläche ${acquisitionArea.id} aktualisiert`,
      userId: ctx.session.userId,
      projectSlug,
      previousRecord: previous,
      updatedRecord: acquisitionArea,
    })

    return typeAcquisitionAreaGeometry(acquisitionArea)
  },
)
