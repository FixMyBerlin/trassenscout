import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { ContactSchema } from "../schema"

const UpdateContactSchema = ProjectSlugRequiredSchema.merge(
  ContactSchema.merge(
    z.object({
      id: z.number(),
    }),
  ),
)

export default resolver.pipe(
  resolver.zod(UpdateContactSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug, ...data }) => {
    return await db.contact.update({
      where: { id },
      data,
    })
  },
)
