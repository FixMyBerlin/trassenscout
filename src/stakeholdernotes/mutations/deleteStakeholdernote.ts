import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import getStakeholdernoteProjectId from "../queries/getStakeholdernoteProjectId"
import db from "db"

import { authorizeProjectAdmin } from "src/authorization"

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
