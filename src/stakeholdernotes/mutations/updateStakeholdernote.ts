import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { StakeholdernoteSchema } from "../schema"

const UpdateStakeholdernote = StakeholdernoteSchema.merge(
  z.object({
    id: z.number(),
  })
)

export default resolver.pipe(
  resolver.zod(UpdateStakeholdernote),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const stakeholdernote = await db.stakeholdernote.update({
      where: { id },
      data,
    })

    return stakeholdernote
  }
)
