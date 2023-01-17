import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetSection = z.object({
  // This accepts type of undefined, but is required at runtime
  slug: z.string().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(resolver.zod(GetSection), resolver.authorize(), async ({ slug }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const section = await db.section.findFirst({ where: { slug } })

  if (!section) throw new NotFoundError()

  return section
})
