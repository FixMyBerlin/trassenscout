import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateSubsubsection = z.object({
  id: z.number(),
  name: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateSubsubsection),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const subsubsection = await db.subsubsection.update({
      where: { id },
      data,
    })

    return subsubsection
  }
)
