import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import { authorizeProjectAdmin } from "src/authorization"
// import getSubsubsectionProjectId from "../queries/getSubsubsectionProjectId"
import { SubsubsectionSchema } from "../schema"

const UpdateSubsubsectionSchema = SubsubsectionSchema.merge(
  z.object({
    id: z.number(),
  })
)

export default resolver.pipe(
  resolver.zod(UpdateSubsubsectionSchema),
  // authorizeProjectAdmin(getSubsubsectionProjectId),
  async ({ id, ...data }) =>
    await db.subsubsection.update({
      where: { id },
      data,
    })
)
