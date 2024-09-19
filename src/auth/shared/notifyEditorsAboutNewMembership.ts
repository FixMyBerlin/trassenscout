import db, { Invite, User } from "@/db"
import { membershipCreatedNotificationToEditors } from "@/emails/mailers/membershipCreatedNotificationToEditors"
import { shortTitle } from "@/src/core/components/text/titles"
import { roleTranslation } from "@/src/memberships/components/roleTranslation.const"
import { getFullname } from "@/src/users/utils/getFullname"
import { Routes } from "@blitzjs/next"

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
        teamPath: Routes.ProjectTeamPage({ projectSlug: membership.project.slug }),
      })
    ).send()
  }
}
