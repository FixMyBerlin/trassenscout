import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"
import { z } from "zod"

const GetProject = z.object({
  // This accepts type of undefined, but is required at runtime
  slug: z.string().optional().refine(Boolean, "Required"),
})

type GetProjectsInput = Pick<Prisma.ProjectFindFirstOrThrowArgs, "select"> & { slug?: string }

export default resolver.pipe(
  resolver.zod(GetProject),
  resolver.authorize(),
  async ({ slug, select = {} }: GetProjectsInput) => {
    const project = await db.project.findFirst({ where: { slug }, select })

    if (!project) throw new NotFoundError()

    return project
  }
)
