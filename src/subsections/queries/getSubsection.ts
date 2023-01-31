import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetSubsection = z.object({
  // This accepts type of undefined, but is required at runtime
  slug: z.string().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetSubsection),
  resolver.authorize(),
  async ({ slug }) => {
    const subsection = await db.subsection.findFirst({ where: { slug } })

    if (!subsection) throw new NotFoundError()

    return subsection
  }
)
