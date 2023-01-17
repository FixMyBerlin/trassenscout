import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetProject = z.object({
  // This accepts type of undefined, but is required at runtime
  slug: z.string().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(resolver.zod(GetProject), resolver.authorize(), async ({ slug }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  console.log("a", { slug })
  const project = await db.project.findFirst({ where: { slug } })

  if (!project) throw new NotFoundError()

  return project
})
