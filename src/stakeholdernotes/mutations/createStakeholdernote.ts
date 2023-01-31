import { resolver } from "@blitzjs/rpc"
import db from "db"
import { StakeholdernoteSchema } from "../schema"

export default resolver.pipe(
  resolver.zod(StakeholdernoteSchema),
  resolver.authorize(),
  async (input) => {
    const stakeholdernote = await db.stakeholdernote.create({ data: input })

    return stakeholdernote
  }
)
