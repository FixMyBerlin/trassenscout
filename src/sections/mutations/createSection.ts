import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { SectionSchema } from "../schema"

export default resolver.pipe(resolver.zod(SectionSchema), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const section = await db.section.create({ data: input })

  return section
})
