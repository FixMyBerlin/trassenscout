import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteSubsubsection = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteSubsubsection),
  resolver.authorize(),
  async ({ id }) => {
    const subsubsection = await db.subsubsection.deleteMany({ where: { id } })

    return subsubsection
  }
)
