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

    const section = await db.section.findFirst({
      where: { slug: sectionSlug, project: { slug: projectSlug } },
    })
    if (!section)
      throw new NotFoundError(
        `Unbekannte Teilstrecke mit ${JSON.stringify({ sectionSlug, projectSlug })}`
      )

    return section
  }
)
