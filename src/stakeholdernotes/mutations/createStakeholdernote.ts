import { resolver } from "@blitzjs/rpc"
import db from "db"
import { StakeholdernoteSchema } from "../schema"

export default resolver.pipe(
  resolver.zod(StakeholdernoteSchema),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const stakeholdernote = await db.stakeholdernote.create({ data: input })

    return stakeholdernote
  }
)
