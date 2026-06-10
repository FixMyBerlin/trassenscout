import { membershipCreatedNotificationToEditors } from "@/emails/mailers/membershipCreatedNotificationToEditors"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { getFullname } from "@/src/components/core/users/getFullname"
import { roleTranslation } from "@/src/components/core/users/roleTranslation.const"
import { Invite, User } from "@/src/prisma/generated/client"
import db from "@/src/server/db.server"

type Props = { invite: Invite | null; invitee: Pick<User, "firstName" | "lastName" | "email"> }

export const notifyEditorsAboutNewMembership = async ({ invite, invitee }: Props) => {
  if (!invite) return

  const projectMemberRoleEditor = await db.membership.findMany({
    where: { projectId: invite.projectId, role: "EDITOR" },
    select: { user: true, project: true },
  })

  for (const membership of projectMemberRoleEditor) {
    await (
      await membershipCreatedNotificationToEditors({
        user: {
          email: membership.user.email,
          name: getFullname(membership.user)!,
        },
        projectName: shortTitle(membership.project.slug),
        invinteeName: getFullname(invitee)!,
        roleName: roleTranslation[invite.role],
        teamPath: `/${membership.project.slug}/contacts/team`,
      })
    ).send()
  }
}
