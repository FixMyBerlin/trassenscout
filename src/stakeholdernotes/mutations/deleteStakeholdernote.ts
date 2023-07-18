import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import { authorizeProjectAdmin } from "src/authorization"
import getStakeholdernoteProjectId from "../queries/getStakeholdernoteProjectId"

const DeleteStakeholdernoteSchema = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteStakeholdernoteSchema),
  authorizeProjectAdmin(getStakeholdernoteProjectId),
  async ({ id }) => {
    return await db.stakeholdernote.deleteMany({ where: { id } })
  },
)
