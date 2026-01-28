import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { membershipUpdateSession } from "@/src/server/memberships/_utils/membershipUpdateSession"
import { longTitle } from "@/src/core/components/text"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { createLogEntry } from "../../logEntries/create/createLogEntry"
import { ProjectSchema } from "../schema"

const UpdateProject = ProjectSlugRequiredSchema.merge(ProjectSchema)

export default resolver.pipe(
  resolver.zod(UpdateProject),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, partnerLogoSrcs, ...data }, ctx: Ctx) => {
    const previous = await db.project.findFirst({ where: { slug: projectSlug } })

    const project = await db.project.update({
      where: { slug: projectSlug },
      data: { ...data, partnerLogoSrcs: partnerLogoSrcs || undefined },
    })

    await createLogEntry({
      action: "UPDATE",
      message: `Projekt ${longTitle(project.slug)} bearbeitet`,
      userId: ctx.session.userId,
      projectId: project.id,
      previousRecord: previous,
      updatedRecord: project,
    })

    // If the slug changed, the session public data can get stale (we store project.slug in session memberships).
    // Refresh session so client-side checks like `useUserCan()` keep working after redirect.
    if (previous?.slug && previous.slug !== project.slug) {
      await membershipUpdateSession(ctx.session.userId!, ctx.session)
    }

    return project
  },
)
