import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { SubsectionSchema } from "../schema"

const UpdateSubsection = SubsectionSchema.merge(
  z.object({
    id: z.number(),
  })
)

export default resolver.pipe(
  resolver.zod(UpdateSubsection),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: Figure out why this `any` is needed
    const subsection = await db.subsection.update({ where: { id }, data } as any)

    return subsection
  }
)
