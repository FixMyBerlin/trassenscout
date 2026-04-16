import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { AcquisitionAreaStatus } from "../schema"

const UpdateAcquisitionAreaStatusSchema = ProjectSlugRequiredSchema.merge(
  AcquisitionAreaStatus.merge(z.object({ id: z.number() })),
)

export default resolver.pipe(
  resolver.zod(UpdateAcquisitionAreaStatusSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug, ...data }) => {
    return await db.acquisitionAreaStatus.update({
      where: { id },
      data,
    })
  },
)
