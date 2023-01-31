import { resolver } from "@blitzjs/rpc"
import db from "db"
import { SectionSchema } from "../schema"

export default resolver.pipe(resolver.zod(SectionSchema), resolver.authorize(), async (input) => {
  const section = await db.section.create({ data: input })

  return section
})
