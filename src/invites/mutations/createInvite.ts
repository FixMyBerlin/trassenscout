import db from "@/db"
import { invitationCreatedNotificationToEditors } from "@/emails/mailers/invitationCreatedNotificationToEditors"
import { authorizeProjectAdmin } from "@/src/authorization"
import { shortTitle } from "@/src/core/components/text"
import { getFullname } from "@/src/users/utils"
import { Ctx, Routes } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { randomBytes } from "crypto"
import { z } from "zod"
import getProjectIdBySlug from "../../projects/queries/getProjectIdBySlug"
import { InviteSchema } from "../schema"

function generateToken(length: number = 32) {
  const buffer = randomBytes(length)
  return buffer.toString("base64url")
}

const CreateInviteSchema = InviteSchema.merge(
  z.object({
    projectSlug: z.string(),
  }),
)

export default resolver.pipe(
  resolver.zod(CreateInviteSchema),
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ projectSlug, ...data }, ctx: Ctx) => {
    const userId = ctx.session.userId
    const projectId = await getProjectIdBySlug(projectSlug)

    const invite = await db.invite.create({
      data: {
        token: generateToken(),
        projectId: projectId!,
        inviterId: userId!,
        ...data,
      },
      select: {
        status: true,
        email: true,
        role: true,
        updatedAt: true,
        inviter: { select: { firstName: true, lastName: true } },
      },
    })

    // Mail: Notify Editor Members
    const projectMemberRoleEditor = await db.membership.findMany({
      where: { projectId, role: "EDITOR" },
      select: { user: true, project: true },
    })
    for (const membership of projectMemberRoleEditor) {
      await (
        await invitationCreatedNotificationToEditors({
          user: {
            email: membership.user.email,
            name: getFullname(membership.user)!,
          },
          projectName: shortTitle(membership.project.slug),
          inviterName: getFullname(invite.inviter)!,
          path: Routes.ProjectTeamInvitesPage({ projectSlug }).href,
        })
      ).send()
    }

    return invite
  },
)
