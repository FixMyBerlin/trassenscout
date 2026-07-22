import { z } from "zod"
import { invitationCreatedMailToUser } from "@/emails/mailers/invitationCreatedMailToUser"
import { invitationCreatedNotificationToEditors } from "@/emails/mailers/invitationCreatedNotificationToEditors"
import { getFullname } from "@/src/components/core/users/getFullname"
import { MembershipRoleEnum, UserRoleEnum } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import type { AppSession } from "@/src/server/auth/session.server"
import { getNumericUserId } from "@/src/server/auth/shared/getNumericUserId"
import { authorizeProjectMemberByProjectSlug } from "@/src/server/authorization/authorizeProjectMember.server"
import { editorRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import {
  getEditableProjectsForInvite,
  inviteProjectSelect,
} from "@/src/server/projects/queries/getEditableProjectsForInvite.server"
import { generateSecureToken } from "@/src/server/utils/generateSecureToken.server"
import { paginate } from "@/src/server/utils/paginate.server"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import {
  formatInviteProjectRoles,
  formatInviteProjects,
} from "@/src/shared/invites/formatInviteProjects"
import { InviteSchema } from "@/src/shared/invites/schemas"
import {
  CreateInvitesSchema,
  GetInviteEmailStatusSchema,
  GetInvitesSchema,
} from "./invites.inputSchemas"

export const CreateInviteSchema = ProjectSlugRequiredSchema.extend(InviteSchema.shape)

export type GetInvitesInput = z.infer<typeof GetInvitesSchema>
export type CreateInvitesInput = z.infer<typeof CreateInvitesSchema>
export type GetInviteEmailStatusInput = z.infer<typeof GetInviteEmailStatusSchema>

type SelectedInviteProject = {
  id: number
  role: MembershipRoleEnum
  slug: string
  subTitle: string | null
}

function canUseMultiProjectInvite(session: AppSession) {
  // MVP: only global admins see the batch UI. Later: ADMIN || hasEditorMembership.
  return session.role === UserRoleEnum.ADMIN
}

function caseInsensitiveEmailFilter(email: string) {
  return { equals: email, mode: "insensitive" as const }
}

function formatDuplicateInviteError(projects: { slug: string; subTitle: string | null }[]) {
  return `Für ${formatInviteProjects(projects)} besteht bereits eine Mitgliedschaft oder eine ausstehende Einladung.`
}

async function notifyEditorsAboutInviteCreated({
  inviterName,
  projects,
}: {
  inviterName: string
  projects: SelectedInviteProject[]
}) {
  const memberships = await db.membership.findMany({
    where: { projectId: { in: projects.map((project) => project.id) }, role: "EDITOR" },
    select: { project: { select: inviteProjectSelect }, user: true },
  })

  const projectById = new Map(projects.map((project) => [project.id, project]))
  const notifications = new Map<
    number,
    {
      projects: SelectedInviteProject[]
      user: { email: string; firstName: string | null; lastName: string | null }
    }
  >()

  for (const membership of memberships) {
    const project = projectById.get(membership.project.id)
    if (!project) continue

    const current = notifications.get(membership.user.id) ?? {
      projects: [],
      user: membership.user,
    }
    current.projects.push(project)
    notifications.set(membership.user.id, current)
  }

  for (const notification of notifications.values()) {
    const projectName = formatInviteProjects(notification.projects)
    await (
      await invitationCreatedNotificationToEditors({
        user: {
          email: notification.user.email,
          name: getFullname(notification.user) ?? notification.user.email,
        },
        projectName,
        projectRoles: formatInviteProjectRoles(notification.projects),
        inviterName,
        path:
          notification.projects.length > 1
            ? "/dashboard"
            : `/${notification.projects[0]!.slug}/invites`,
      })
    ).send()
  }
}

async function createInvitesForSession({
  input,
  requireAdminGate,
  session,
}: {
  input: CreateInvitesInput
  requireAdminGate: boolean
  session: AppSession
}) {
  if (requireAdminGate && !canUseMultiProjectInvite(session)) {
    throw new Error("Mehrprojekt-Einladungen sind aktuell nur für Admins verfügbar.")
  }

  for (const project of input.projects) {
    await authorizeProjectMemberByProjectSlug(session, project.projectSlug, editorRoles)
  }

  const email = input.email.toLocaleLowerCase()
  const inviterId = getNumericUserId(session.userId)
  const token = generateSecureToken()

  const result = await db.$transaction(async (tx) => {
    const projects = await tx.project.findMany({
      where: { slug: { in: input.projects.map((project) => project.projectSlug) } },
      select: inviteProjectSelect,
    })
    const projectBySlug = new Map(projects.map((project) => [project.slug, project]))
    const selectedProjects = input.projects.map((project) => {
      const loadedProject = projectBySlug.get(project.projectSlug)
      if (!loadedProject) throw new Error(`Projekt ${project.projectSlug} wurde nicht gefunden.`)
      return { ...loadedProject, role: project.role }
    })
    const projectIds = selectedProjects.map((project) => project.id)

    const [pendingInvites, existingMemberships, inviter] = await Promise.all([
      tx.invite.findMany({
        where: {
          email: caseInsensitiveEmailFilter(email),
          projectId: { in: projectIds },
          status: "PENDING",
        },
        select: { project: { select: inviteProjectSelect } },
      }),
      tx.membership.findMany({
        where: {
          projectId: { in: projectIds },
          user: { email: caseInsensitiveEmailFilter(email) },
        },
        select: { project: { select: inviteProjectSelect } },
      }),
      tx.user.findUniqueOrThrow({
        where: { id: inviterId },
        select: { email: true, firstName: true, lastName: true },
      }),
    ])

    const conflictingProjects = [
      ...pendingInvites.map((invite) => invite.project),
      ...existingMemberships.map((membership) => membership.project),
    ]
    if (conflictingProjects.length > 0) {
      throw new Error(formatDuplicateInviteError(conflictingProjects))
    }

    await tx.invite.createMany({
      data: selectedProjects.map((project) => ({
        email,
        inviterId,
        projectId: project.id,
        role: project.role,
        token,
      })),
    })

    return { email, inviter, projects: selectedProjects, token }
  })

  const inviterName = getFullname(result.inviter) ?? result.inviter.email
  const projectName = formatInviteProjects(result.projects)

  try {
    for (const project of result.projects) {
      await createLogEntry({
        action: "CREATE",
        message: `Einladung an ${result.email} versendet`,
        userId: inviterId,
        projectId: project.id,
      })
    }

    await (
      await invitationCreatedMailToUser({
        userEmail: result.email,
        projectName,
        inviterName,
        signupPath: `/auth/signup?inviteToken=${result.token}`,
        loginPath: `/auth/login?inviteToken=${result.token}`,
      })
    ).send()

    await notifyEditorsAboutInviteCreated({
      inviterName,
      projects: result.projects,
    })
  } catch (error) {
    console.error("Invite was created, but post-create notifications failed.", error)
  }

  return result
}

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
          id: true,
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
  const result = await createInvitesForSession({
    input: {
      email: input.email,
      projects: [{ projectSlug: input.projectSlug, role: input.role }],
    },
    requireAdminGate: false,
    session,
  })

  const project = result.projects[0]!
  return {
    email: result.email,
    project: { slug: project.slug, subTitle: project.subTitle },
    role: project.role,
    status: "PENDING" as const,
  }
}

export async function createInvites(headers: Headers, input: CreateInvitesInput) {
  const session = await endpointAuth.session(headers)
  const result = await createInvitesForSession({ input, requireAdminGate: true, session })

  return {
    email: result.email,
    projects: result.projects.map((project) => ({
      role: project.role,
      slug: project.slug,
      subTitle: project.subTitle,
    })),
  }
}

export async function getInviteEmailStatus(headers: Headers, input: GetInviteEmailStatusInput) {
  const session = await endpointAuth.session(headers)
  if (!canUseMultiProjectInvite(session)) {
    throw new Error("Mehrprojekt-Einladungen sind aktuell nur für Admins verfügbar.")
  }
  const email = input.email.toLocaleLowerCase()

  const editableProjects = await getEditableProjectsForInvite(session)
  const projectIds = editableProjects.map((project) => project.id)
  // Callers who can't invite anywhere get nothing back — otherwise this endpoint
  // would leak whether an arbitrary email is a registered account.
  if (projectIds.length === 0) {
    return { accountExists: false, projectStates: [] }
  }

  const [account, memberships, pendingInvites] = await Promise.all([
    db.user.findFirst({
      where: { email: caseInsensitiveEmailFilter(email) },
      select: { id: true },
    }),
    db.membership.findMany({
      where: { projectId: { in: projectIds }, user: { email: caseInsensitiveEmailFilter(email) } },
      select: { projectId: true, role: true },
    }),
    db.invite.findMany({
      where: {
        email: caseInsensitiveEmailFilter(email),
        projectId: { in: projectIds },
        status: "PENDING",
      },
      select: { projectId: true, role: true },
    }),
  ])

  const membershipByProjectId = new Map(
    memberships.map((membership) => [membership.projectId, membership]),
  )
  const inviteByProjectId = new Map(pendingInvites.map((invite) => [invite.projectId, invite]))

  return {
    accountExists: Boolean(account),
    projectStates: editableProjects.map((project) => {
      const membership = membershipByProjectId.get(project.id)
      const invite = inviteByProjectId.get(project.id)
      return {
        projectId: project.id,
        slug: project.slug,
        subTitle: project.subTitle,
        current: membership
          ? ({ role: membership.role, type: "membership" } as const)
          : invite
            ? ({ role: invite.role, type: "invite" } as const)
            : ("none" as const),
      }
    }),
  }
}
