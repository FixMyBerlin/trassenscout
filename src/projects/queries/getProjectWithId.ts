import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db, { Prisma, Project } from "db"
import { z } from "zod"

type ProjectWithId = Pick<Project, "id">

const GetProject = z.object({
  // This accepts type of undefined, but is required at runtime
  slug: z.string().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(resolver.zod(GetProject), resolver.authorize(), async ({ slug }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const project = await db.project.findFirst({ where: { slug }, select: { id: true } })

  if (!project) throw new NotFoundError()

  return project as ProjectWithId
})
