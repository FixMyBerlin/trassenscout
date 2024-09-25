import db from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
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
