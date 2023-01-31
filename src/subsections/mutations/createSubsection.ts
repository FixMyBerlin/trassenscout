import { resolver } from "@blitzjs/rpc"
import db from "db"
import { SubsectionSchema } from "../schema"

export default resolver.pipe(
  resolver.zod(SubsectionSchema),
  resolver.authorize(),
  async (input) => {
    // TODO: Figure out why this `any` is needed
    const subsection = await db.subsection.create({ data: input } as any)

    return subsection
  }
)
