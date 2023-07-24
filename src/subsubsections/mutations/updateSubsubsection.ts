import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

import { SubsubsectionWithPosition } from "../queries/getSubsubsection"
import { SubsubsectionSchema } from "../schema"
import getSubsubsectionProjectId from "../queries/getSubsubsectionProjectId"
import { authorizeProjectAdmin } from "src/authorization"
import db from "db"

const UpdateSubsubsectionSchema = SubsubsectionSchema.merge(
  z.object({
    id: z.number(),
  }),
)

export default resolver.pipe(
  resolver.zod(UpdateSubsubsectionSchema),
  authorizeProjectAdmin(getSubsubsectionProjectId),
  async ({ id, ...data }) => {
    const subsubsection = await db.subsubsection.update({
      where: { id },
      data,
    })
    return subsubsection as SubsubsectionWithPosition // Tip: Validate type shape with `satisfies`
  },
)
