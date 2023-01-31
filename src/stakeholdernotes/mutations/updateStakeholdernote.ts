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
    const stakeholdernote = await db.stakeholdernote.update({
      where: { id },
      data,
    })

    return stakeholdernote
  }
)
