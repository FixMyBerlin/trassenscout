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
    const subsection = await db.subsection.deleteMany({ where: { id } })

    return subsection
  }
)
