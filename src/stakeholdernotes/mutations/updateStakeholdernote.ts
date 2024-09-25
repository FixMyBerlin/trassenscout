import db from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import getStakeholdernoteProjectId from "../queries/getStakeholdernoteProjectId"
import { StakeholdernoteSchema } from "../schema"

const UpdateStakeholdernoteSchema = StakeholdernoteSchema.merge(
  z.object({
    id: z.number(),
  }),
)

export default resolver.pipe(
  resolver.zod(UpdateStakeholdernoteSchema),
  authorizeProjectAdmin(getStakeholdernoteProjectId),
  async ({ id, ...data }) =>
    await db.stakeholdernote.update({
      where: { id },
      data,
    }),
)
