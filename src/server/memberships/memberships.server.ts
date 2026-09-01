import { z } from "zod"
import { frenchQuote } from "@/src/components/core/components/text/quote"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { getFullname } from "@/src/components/core/users/getFullname"
import { roleTranslation } from "@/src/components/core/users/roleTranslation.const"
import { MembershipRoleEnum } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { selectUserFieldsForSession } from "@/src/server/auth/shared/selectUserFieldsForSession"
import { editorRoles, viewerRoles } from "@/src/server/authorization/constants"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { MembershipSchema, SaveUserMembershipsSchema } from "@/src/shared/memberships/schemas"
import { authorizeProjectMemberByProjectSlug } from "../authorization/authorizeProjectMember.server"
import db from "../db.server"
import { cleanupBeforeMembershipDelete } from "./cleanupMembershipDelete.server"
import { membershipUpdateSession } from "./membershipUpdateSession"

export const UpdateMembershipRoleSchema = z.object({
  membershipId: z.number().int().positive(),
  role: MembershipSchema.shape.role,
})

export const DeleteMembershipSchema = z.object({
  membershipId: z.number().int().positive(),
})

export const DeleteProjectMembershipSchema = ProjectSlugRequiredSchema.extend({
  membershipId: z.number().int().positive(),
})

export const UpdateProjectMembershipRoleSchema = ProjectSlugRequiredSchema.extend({
  membershipId: z.number().int().positive(),
  role: MembershipSchema.shape.role,
})

export const GetProjectUsersSchema = ProjectSlugRequiredSchema.extend({
  role: MembershipSchema.shape.role.optional(),
})

const membershipInclude = {
  project: {
    select: {
      id: true,
      slug: true,
      subTitle: true,
    },
  },
  user: {
    select: {
      email: true,
      firstName: true,
      id: true,
      institution: true,
      lastName: true,
      role: true,
    },
  },
} as const

const membershipForLogInclude = {
  project: { select: { slug: true } },
  user: { select: { firstName: true, lastName: true, email: true } },
} as const

export async function createMembership(headers: Headers, input: z.infer<typeof MembershipSchema>) {
  const adminSession = await endpointAuth.admin(headers)
  const record = await db.membership.create({
    data: input,
    include: membershipInclude,
  })
  const userName = getFullname(record.user) ?? record.user.email

  await createLogEntry({
    action: "CREATE",
    message: `${userName} wurde dem Projektteam ${frenchQuote(shortTitle(record.project.slug))} hinzugefügt.`,
    userId: Number(adminSession.userId),
    projectId: record.projectId,
    membershipId: record.id,
    updatedRecord: {
      id: record.id,
      userId: record.userId,
      userName,
      projectId: record.projectId,
      role: record.role,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    },
  })

  return record
}

export async function updateMembershipRole(
  headers: Headers,
  input: z.infer<typeof UpdateMembershipRoleSchema>,
) {
  const adminSession = await endpointAuth.admin(headers)
  const previous = await db.membership.findUniqueOrThrow({
    where: { id: input.membershipId },
    include: membershipForLogInclude,
  })
  const updated = await db.membership.update({
    where: { id: input.membershipId },
    data: { role: input.role },
    include: membershipInclude,
  })
  const userName = getFullname(previous.user) ?? previous.user.email

  await createLogEntry({
    action: "UPDATE",
    message: `${userName} hat nun ${roleTranslation[input.role]}.`,
    userId: Number(adminSession.userId),
    projectId: previous.projectId,
    membershipId: updated.id,
    previousRecord: {
      id: previous.id,
      userId: previous.userId,
      userName,
      projectId: previous.projectId,
      role: previous.role,
      createdAt: previous.createdAt,
      updatedAt: previous.updatedAt,
    },
    updatedRecord: {
      id: updated.id,
      userId: updated.userId,
      userName,
      projectId: updated.projectId,
      role: updated.role,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    },
  })

  return updated
}

export async function deleteMembership(
  headers: Headers,
  input: z.infer<typeof DeleteMembershipSchema>,
) {
  const adminSession = await endpointAuth.admin(headers)
  const previous = await db.membership.findUniqueOrThrow({
    where: { id: input.membershipId },
    include: membershipForLogInclude,
  })
  const record = await db.$transaction(async (tx) => {
    await cleanupBeforeMembershipDelete({
      membershipId: previous.id,
      projectId: previous.projectId,
      userId: previous.userId,
      client: tx,
    })
    return tx.membership.delete({
      where: { id: input.membershipId },
      include: membershipInclude,
    })
  })

  const userName = getFullname(previous.user) ?? previous.user.email

  await createLogEntry({
    action: "DELETE",
    message: `${userName} wurde aus dem Projektteam ${frenchQuote(shortTitle(previous.project.slug))} entfernt.`,
    userId: Number(adminSession.userId),
    projectId: previous.projectId,
    previousRecord: { id: previous.id },
  })

  return record
}

export async function getProjectUsers(
  headers: Headers,
  input: z.infer<typeof GetProjectUsersSchema>,
) {
  const session = await endpointAuth.session(headers)
  await authorizeProjectMemberByProjectSlug(session, input.projectSlug, viewerRoles)

  const whereRole = input.role ? { role: input.role } : {}
  const users = await db.user.findMany({
    where: {
      memberships: { some: { project: { slug: input.projectSlug }, ...whereRole } },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }, { email: "asc" }],
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      ...selectUserFieldsForSession,
    },
  })

  type NonLeakingUser = Omit<(typeof users)[number], "memberships"> & {
    currentMembershipId: number
    currentMembershipRole: MembershipRoleEnum
  }

  return users.map((user) => {
    const { memberships, ...secureUser } = user
    const membership = memberships.find((m) => m.project.slug === input.projectSlug)
    return {
      ...secureUser,
      currentMembershipId: membership?.id,
      currentMembershipRole: membership?.role,
    } as NonLeakingUser
  })
}

export async function deleteProjectMembership(
  headers: Headers,
  input: z.infer<typeof DeleteProjectMembershipSchema>,
) {
  const session = await endpointAuth.session(headers)
  await authorizeProjectMemberByProjectSlug(session, input.projectSlug, editorRoles)

  const previous = await db.membership.findFirstOrThrow({
    where: { id: input.membershipId, project: { slug: input.projectSlug } },
    include: membershipForLogInclude,
  })
  await membershipUpdateSession(previous.userId)
  await db.$transaction(async (tx) => {
    await cleanupBeforeMembershipDelete({
      membershipId: previous.id,
      projectId: previous.projectId,
      userId: previous.userId,
      client: tx,
    })
    await tx.membership.deleteMany({
      where: { id: input.membershipId, project: { slug: input.projectSlug } },
    })
  })

  const userName = getFullname(previous.user) ?? previous.user.email

  await createLogEntry({
    action: "DELETE",
    message: `${userName} wurde aus dem Projektteam ${frenchQuote(shortTitle(previous.project.slug))} entfernt.`,
    userId: Number(session.userId),
    projectId: previous.projectId,
    previousRecord: { id: previous.id },
  })
}

export async function updateProjectMembershipRole(
  headers: Headers,
  input: z.infer<typeof UpdateProjectMembershipRoleSchema>,
) {
  const session = await endpointAuth.session(headers)
  await authorizeProjectMemberByProjectSlug(session, input.projectSlug, editorRoles)

  const previous = await db.membership.findFirstOrThrow({
    where: { id: input.membershipId, project: { slug: input.projectSlug } },
    include: membershipForLogInclude,
  })

  const updated = await db.membership.update({
    where: { id: previous.id },
    data: { role: input.role },
  })
  await membershipUpdateSession(updated.userId)

  const userName = getFullname(previous.user) ?? previous.user.email

  await createLogEntry({
    action: "UPDATE",
    message: `${userName} hat nun ${roleTranslation[input.role]}.`,
    userId: Number(session.userId),
    projectId: previous.projectId,
    membershipId: updated.id,
    previousRecord: {
      id: previous.id,
      userId: previous.userId,
      userName,
      projectId: previous.projectId,
      role: previous.role,
      createdAt: previous.createdAt,
      updatedAt: previous.updatedAt,
    },
    updatedRecord: {
      id: updated.id,
      userId: updated.userId,
      userName,
      projectId: updated.projectId,
      role: updated.role,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    },
  })

  return updated
}

export async function saveUserMemberships(
  headers: Headers,
  input: z.infer<typeof SaveUserMembershipsSchema>,
) {
  const adminSession = await endpointAuth.admin(headers)

  const targetUser = await db.user.findUniqueOrThrow({
    where: { id: input.userId },
    select: { id: true, firstName: true, lastName: true, email: true },
  })
  const displayName = getFullname(targetUser) ?? targetUser.email

  const projectIds = [...new Set(input.projectRoles.map(({ projectId }) => projectId))]
  const projects = await db.project.findMany({
    where: { id: { in: projectIds } },
    select: { id: true, slug: true },
  })
  const slugByProjectId = new Map(projects.map((project) => [project.id, project.slug]))

  const existing = await db.membership.findMany({
    where: { userId: input.userId },
  })
  const existingByProjectId = new Map(
    existing.map((membership) => [membership.projectId, membership]),
  )

  for (const { projectId, role } of input.projectRoles) {
    const current = existingByProjectId.get(projectId)
    const projectSlug = slugByProjectId.get(projectId)

    if (role === null) {
      if (current) {
        await db.$transaction(async (tx) => {
          await cleanupBeforeMembershipDelete({
            membershipId: current.id,
            projectId,
            userId: current.userId,
            client: tx,
          })
          await tx.membership.delete({ where: { id: current.id } })
        })

        await createLogEntry({
          action: "DELETE",
          message: `${displayName} wurde aus dem Projektteam ${frenchQuote(shortTitle(projectSlug ?? ""))} entfernt.`,
          userId: Number(adminSession.userId),
          projectId,
          previousRecord: { id: current.id },
        })
      }
      continue
    }

    if (!current) {
      const created = await db.membership.create({
        data: { userId: input.userId, projectId, role },
      })

      await createLogEntry({
        action: "CREATE",
        message: `${displayName} wurde dem Projektteam ${frenchQuote(shortTitle(projectSlug ?? ""))} hinzugefügt.`,
        userId: Number(adminSession.userId),
        projectId,
        membershipId: created.id,
        updatedRecord: {
          id: created.id,
          userId: created.userId,
          userName: displayName,
          projectId: created.projectId,
          role: created.role,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        },
      })
      continue
    }

    if (current.role !== role) {
      const updated = await db.membership.update({
        where: { id: current.id },
        data: { role },
      })

      await createLogEntry({
        action: "UPDATE",
        message: `${displayName} hat nun ${roleTranslation[role]}.`,
        userId: Number(adminSession.userId),
        projectId,
        membershipId: updated.id,
        previousRecord: {
          id: current.id,
          userId: current.userId,
          userName: displayName,
          projectId: current.projectId,
          role: current.role,
          createdAt: current.createdAt,
          updatedAt: current.updatedAt,
        },
        updatedRecord: {
          id: updated.id,
          userId: updated.userId,
          userName: displayName,
          projectId: updated.projectId,
          role: updated.role,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        },
      })
    }
  }

  // Editing your own memberships must not delete the current session — that aborts the
  // save response and leaves the UI looking like nothing was stored.
  if (Number(adminSession.userId) !== input.userId) {
    await membershipUpdateSession(input.userId)
  }
}
