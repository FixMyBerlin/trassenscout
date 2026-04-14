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
import { validateAcquisitionAreaInput } from "../_utils/validateAcquisitionAreaInput"
import { AcquisitionAreaSchema } from "../schema"
import { typeAcquisitionAreaGeometry } from "../utils/typeAcquisitionAreaGeometry"

const CreateAcquisitionAreaSchema = ProjectSlugRequiredSchema.merge(AcquisitionAreaSchema)

export default resolver.pipe(
  resolver.zod(CreateAcquisitionAreaSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...input }, ctx: Ctx) => {
    await validateAcquisitionAreaInput({
      projectSlug,
      subsubsectionId: input.subsubsectionId,
      parcelId: input.parcelId,
      acquisitionAreaStatusId: input.acquisitionAreaStatusId,
    })

    const acquisitionArea = await db.acquisitionArea.create({
      data: {
        ...input,
        acquisitionAreaStatusId: input.acquisitionAreaStatusId ?? null,
      },
    })

    await createLogEntry({
      action: "CREATE",
      message: `Erwerbsfläche ${acquisitionArea.id} erstellt`,
      userId: ctx.session.userId,
      projectSlug,
    })

    return typeAcquisitionAreaGeometry(acquisitionArea)
  },
)
