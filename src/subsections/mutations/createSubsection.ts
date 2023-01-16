import { resolver } from "@blitzjs/rpc"
import db from "db"
import { SubsectionSchema } from "../schema"

export default resolver.pipe(
  resolver.zod(SubsectionSchema),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    // TODO: Figure out why this `any` is needed
    const subsection = await db.subsection.create({ data: input } as any)

    return subsection
  }
)
