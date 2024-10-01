import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { UploadSchema } from "../schema"

const UpdateUploadSchema = ProjectSlugRequiredSchema.merge(
  UploadSchema.merge(z.object({ id: z.number() })),
)

export default resolver.pipe(
  resolver.zod(UpdateUploadSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug, ...data }) => {
    return await db.upload.update({
      where: { id },
      data,
      include: { subsection: { select: { id: true, slug: true, start: true, end: true } } },
    })
  },
)
