import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { SubsubsectionWithPosition } from "../queries/getSubsubsection"
import { SubsubsectionSchema } from "../schema"

const UpdateSubsubsectionSchema = SubsubsectionSchema.merge(
  z.object({
    id: z.number(),
  })
)

export default resolver.pipe(
  resolver.zod(UpdateSubsubsectionSchema),
  // authorizeProjectAdmin(getSubsubsectionProjectId),
  async ({ id, ...data }) => {
    const subsubsection = await db.subsubsection.update({
      where: { id },
      data,
    })
    return subsubsection as SubsubsectionWithPosition // Tip: Validate type shape with `satisfies`
  }
)
