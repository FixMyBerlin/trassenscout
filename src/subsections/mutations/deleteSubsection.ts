import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteSubsection = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteSubsection),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const subsection = await db.subsection.deleteMany({ where: { id } })

    return subsection
  }
)
