import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import { authorizeProjectAdmin } from "src/authorization"
import getSubsectionProjectId from "../queries/getSubsectionProjectId"
import { SubsectionSchema } from "../schema"

const UpdateSubsectionSchema = SubsectionSchema.merge(
  z.object({
    id: z.number(),
  })
)

export default resolver.pipe(
  resolver.zod(UpdateSubsectionSchema),
  authorizeProjectAdmin(getSubsectionProjectId),
  async ({ id, ...data }) =>
    await db.subsection.update({
      where: { id },
      data,
    })
)
