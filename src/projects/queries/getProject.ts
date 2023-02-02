import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"
import { z } from "zod"
import { Project } from "@prisma/client"

const GetProject = z.object({
  // This accepts type of undefined, but is required at runtime
  slug: z.string().optional().refine(Boolean, "Required"),
  scope: z.enum(["all", "id"]).optional(),
})

type GetProjectInput = z.infer<typeof GetProject>

export default resolver.pipe(
  resolver.zod(GetProject),
  resolver.authorize(),
  async ({ slug, scope }: GetProjectInput) => {
    let project
    switch (scope) {
      case "id":
        project = (await db.project.findFirst({ where: { slug }, select: { id: true } })) as Pick<
          Project,
          "id"
        >
        break
      default:
        project = (await db.project.findFirst({ where: { slug } })) as Project
        break
    }

    if (!project) throw new NotFoundError()

    return project
  }
)
