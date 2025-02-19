import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { SubsectionSchema } from "../schema"

export const CreateSubsectionsSchema = ProjectSlugRequiredSchema.merge(
  z.object({
    subsections: z.array(
      SubsectionSchema.omit({
        managerId: true,
        operatorId: true,
        description: true,
        subsubsectionStatusId: true,
      }),
    ),
  }),
)

export default resolver.pipe(
  resolver.zod(CreateSubsectionsSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ subsections }) => {
    return await db.subsection.createMany({
      data: subsections,
    })
  },
)
