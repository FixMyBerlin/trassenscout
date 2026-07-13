import { z } from "zod"
import { invitationCreatedMailToUser } from "@/emails/mailers/invitationCreatedMailToUser"
import { invitationCreatedNotificationToEditors } from "@/emails/mailers/invitationCreatedNotificationToEditors"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { getFullname } from "@/src/components/core/users/getFullname"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { authorizeProjectMemberByProjectSlug } from "@/src/server/authorization/authorizeProjectMember.server"
import { editorRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { getProjectIdBySlug } from "@/src/server/projects/queries/getProjectIdBySlug.server"
import { generateSecureToken } from "@/src/server/utils/generateSecureToken.server"
import { paginate } from "@/src/server/utils/paginate.server"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { InviteSchema } from "@/src/shared/invites/schemas"
import { GetInvitesSchema } from "./invites.inputSchemas"

export const CreateInviteSchema = ProjectSlugRequiredSchema.extend(InviteSchema.shape)

export type GetInvitesInput = z.infer<typeof GetInvitesSchema>

export async function getInvites(headers: Headers, input: GetInvitesInput) {
  const session = await endpointAuth.session(headers)
  await authorizeProjectMemberByProjectSlug(session, input.projectSlug, editorRoles)

  const { projectSlug, skip = 0, take = 100 } = input
  const safeWhere = { project: { slug: projectSlug } }

  const {
    items: invites,
    hasMore,
    nextPage,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.invite.count({ where: safeWhere }),
    query: (paginateArgs) =>
      db.invite.findMany({
        ...paginateArgs,
        where: safeWhere,
        orderBy: { id: "asc" },
        select: {
          status: true,
          email: true,
          role: true,
          updatedAt: true,
          inviter: { select: { firstName: true, lastName: true } },
        },
      }),
  })

  return { invites, nextPage, hasMore, count }
}

export async function createInvite(headers: Headers, input: z.infer<typeof CreateInviteSchema>) {
  const session = await endpointAuth.session(headers)
  await authorizeProjectMemberByProjectSlug(session, input.projectSlug, editorRoles)

  const { projectSlug, ...data } = input
  const projectId = await getProjectIdBySlug(projectSlug)
  const userId = Number(session.userId)

  const invite = await db.invite.create({
    data: {
      token: generateSecureToken(),
      projectId,
      inviterId: userId,
      ...data,
      email: data.email.toLocaleLowerCase(),
    },
    select: {
      id: true,
      status: true,
      email: true,
      role: true,
      token: true,
      project: { select: { slug: true, subTitle: true } },
      inviter: { select: { firstName: true, lastName: true, email: true } },
    },
  })

  await createLogEntry({
    action: "CREATE",
    message: `Einladung an ${invite.email} versendet`,
    userId,
    projectId,
  })

  await (
    await invitationCreatedMailToUser({
      userEmail: invite.email,
      projectName: shortTitle(invite.project.slug),
      inviterName: getFullname(invite.inviter) ?? invite.inviter.email,
      signupPath: `/auth/signup?inviteToken=${invite.token}`,
      loginPath: `/auth/login?inviteToken=${invite.token}`,
    })
  ).send()

  const projectMemberRoleEditor = await db.membership.findMany({
    where: { projectId, role: "EDITOR" },
    select: { user: true, project: true },
  })
  for (const membership of projectMemberRoleEditor) {
    await (
      await invitationCreatedNotificationToEditors({
        user: {
          email: membership.user.email,
          name: getFullname(membership.user) ?? membership.user.email,
        },
        projectName: shortTitle(membership.project.slug),
        inviterName: getFullname(invite.inviter) ?? invite.inviter.email,
        path: `/${projectSlug}/invites`,
      })
    ).send()
  }

  const { token: _token, ...saveInvite } = invite
  return saveInvite
}
