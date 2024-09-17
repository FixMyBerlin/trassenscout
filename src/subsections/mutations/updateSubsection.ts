import db from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { SubsectionWithPosition } from "../queries/getSubsection"
import getSubsectionProjectId from "../queries/getSubsectionProjectId"
import { SubsectionSchema } from "../schema"

const UpdateSubsectionSchema = SubsectionSchema.merge(
  z.object({
    id: z.number(),
  }),
)

export default resolver.pipe(
  resolver.zod(UpdateSubsectionSchema),
  authorizeProjectAdmin(getSubsectionProjectId),
  async ({ id, ...data }) => {
    const subsection = await db.subsection.update({
      where: { id },
      data,
    })
    return subsection as SubsectionWithPosition // Tip: Validate type shape with `satisfies`
  },
)
