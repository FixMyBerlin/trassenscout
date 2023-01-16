import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { SectionSchema } from "../schema"

const UpdateSection = SectionSchema.merge(
  z.object({
    id: z.number(),
  })
)

export default resolver.pipe(
  resolver.zod(UpdateSection),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const section = await db.section.update({ where: { id }, data })

    return section
  }
)
