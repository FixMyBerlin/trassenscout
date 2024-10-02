import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { SubsubsectionStatus } from "../schema"

const UpdateSubsubsectionStatusSchema = SubsubsectionStatus.merge(
  z.object({
    id: z.number(),
  }),
)

export default resolver.pipe(
  resolver.zod(UpdateSubsubsectionStatusSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, ...data }) =>
    await db.subsubsectionStatus.update({
      where: { id },
      data,
    }),
)
