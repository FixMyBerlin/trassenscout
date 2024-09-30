import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { SubsectionWithPosition } from "../queries/getSubsection"
import { SubsectionSchema } from "../schema"

const UpdateSubsectionSchema = SubsectionSchema.merge(z.object({ id: z.number() }))

export default resolver.pipe(
  resolver.zod(UpdateSubsectionSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, ...data }) => {
    const subsection = await db.subsection.update({
      where: { id },
      data,
    })
    return subsection as SubsectionWithPosition // Tip: Validate type shape with `satisfies`
  },
)
