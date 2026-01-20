import db from "@/db"
import { invitationCreatedMailToUser } from "@/emails/mailers/invitationCreatedMailToUser"
import { invitationCreatedNotificationToEditors } from "@/emails/mailers/invitationCreatedNotificationToEditors"
import { getFullname } from "@/src/app/_components/users/utils/getFullname"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { shortTitle } from "@/src/core/components/text"
import { getProjectIdBySlug } from "@/src/server/projects/queries/getProjectIdBySlug"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { randomBytes } from "crypto"
import { Route } from "next"
import { createLogEntry } from "../../logEntries/create/createLogEntry"
import { InviteSchema } from "../schema"

function generateToken(length: number = 32) {
  const buffer = randomBytes(length)
  return buffer.toString("base64url")
}

export const CreateInviteSchema = ProjectSlugRequiredSchema.merge(InviteSchema)

export default resolver.pipe(
  resolver.zod(CreateInviteSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...data }, ctx: Ctx) => {
    const userId = ctx.session.userId
    const projectId = await getProjectIdBySlug(projectSlug)

    const invite = await db.invite.create({
      data: {
        token: generateToken(),
        projectId: projectId!,
        inviterId: userId!,
        ...data,
        email: data.email.toLocaleLowerCase(),
      },
      select: {
        id: true,
        status: true,
        email: true,
        role: true,
        updatedAt: true,
        token: true,
        inviter: { select: { firstName: true, lastName: true } },
        project: { select: { slug: true } },
      },
    })

    // Mail: Notify Invited Person (Invitee)
    await (
      await invitationCreatedMailToUser({
        userEmail: invite.email,
        projectName: shortTitle(invite.project.slug),
        inviterName: getFullname(invite.inviter)!,
        signupPath: `/auth/signup?inviteToken=${invite.token}`,
        loginPath: `/auth/login?inviteToken=${invite.token}`,
      })
    ).send()

    // Mail: Notify all Editor Members
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
          path: `/${projectSlug}/invites` as Route,
        })
      ).send()
    }

    await createLogEntry({
      action: "CREATE",
      message: `${data.email.toLocaleLowerCase()} wurde eingeladen`,
      userId: ctx.session.userId,
      projectId,
    })

    const { token, ...saveInvite } = invite
    return saveInvite
  },
)
