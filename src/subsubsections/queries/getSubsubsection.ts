import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetSubsubsection = z.object({
  slug: z.string(),
})

export default resolver.pipe(
  resolver.zod(GetSubsubsection),
  resolver.authorize(),
  async ({ slug }) => {
    const subsubsection = await db.subsubsection.findFirst({ where: { slug } })

    if (!subsubsection) throw new NotFoundError()

    return subsubsection
  }
)
