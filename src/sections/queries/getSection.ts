import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Project } from "db"
import { z } from "zod"

const GetSection = z.object({
  // This accepts type of undefined, but is required at runtime
  sectionSlug: z.string().optional().refine(Boolean, "Required"),
  projectSlug: z.string().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetSection),
  resolver.authorize(),
  async ({ sectionSlug, projectSlug }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant

    const project = await db.project.findFirst({
      where: { slug: projectSlug },
      select: { id: true },
    })
    if (!project) throw new NotFoundError(`Unknown project with slug ${projectSlug}`)

    const section = await db.section.findFirst({
      where: { slug: sectionSlug, projectId: project.id },
    })
    if (!section) throw new NotFoundError(`Unknown section with slug ${sectionSlug}`)

    return section
  }
)
