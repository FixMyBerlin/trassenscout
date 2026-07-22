import { membershipCreatedNotificationToEditors } from "@/emails/mailers/membershipCreatedNotificationToEditors"
import { getFullname } from "@/src/components/core/users/getFullname"
import { Invite, Project, User } from "@/src/prisma/generated/browser"
import db from "@/src/server/db.server"
import {
  formatInviteProjectRoles,
  formatInviteProjects,
} from "@/src/shared/invites/formatInviteProjects"

type InviteWithProject = Invite & {
  project: Pick<Project, "id" | "slug" | "subTitle">
}

type Props = {
  invitee: Pick<User, "firstName" | "lastName" | "email">
  invites: InviteWithProject[]
}

export const notifyEditorsAboutNewMembership = async ({ invites, invitee }: Props) => {
  if (invites.length === 0) return

  const projectMemberRoleEditor = await db.membership.findMany({
    where: { projectId: { in: invites.map((invite) => invite.projectId) }, role: "EDITOR" },
    select: { projectId: true, user: true },
  })

  const inviteByProjectId = new Map(invites.map((invite) => [invite.projectId, invite]))
  const notifications = new Map<
    number,
    {
      invites: InviteWithProject[]
      user: { email: string; firstName: string | null; lastName: string | null }
    }
  >()

  for (const membership of projectMemberRoleEditor) {
    const invite = inviteByProjectId.get(membership.projectId)
    if (!invite) continue

    const current = notifications.get(membership.user.id) ?? {
      invites: [],
      user: membership.user,
    }
    current.invites.push(invite)
    notifications.set(membership.user.id, current)
  }

  for (const notification of notifications.values()) {
    const projectRoles = notification.invites.map((invite) => ({
      role: invite.role,
      slug: invite.project.slug,
      subTitle: invite.project.subTitle,
    }))

    await (
      await membershipCreatedNotificationToEditors({
        user: {
          email: notification.user.email,
          name: getFullname(notification.user) ?? notification.user.email,
        },
        projectName: formatInviteProjects(projectRoles),
        invinteeName: getFullname(invitee) ?? invitee.email,
        projectRoles: formatInviteProjectRoles(projectRoles),
        teamPath:
          projectRoles.length > 1 ? "/dashboard" : `/${projectRoles[0]!.slug}/contacts/team`,
      })
    ).send()
  }
}
