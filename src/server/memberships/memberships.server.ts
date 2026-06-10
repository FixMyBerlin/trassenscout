import { z } from "zod"
import { MembershipRoleEnum } from "@/src/prisma/generated/client"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { selectUserFieldsForSession } from "@/src/server/auth/shared/selectUserFieldsForSession"
import { editorRoles, viewerRoles } from "@/src/server/authorization/constants"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { MembershipSchema } from "@/src/shared/memberships/schemas"
import { authorizeProjectMemberByProjectSlug } from "../authorization/authorizeProjectMember.server"
import db from "../db.server"
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

export async function createMembership(headers: Headers, input: z.infer<typeof MembershipSchema>) {
  await endpointAuth.admin(headers)
  return db.membership.create({
    data: input,
    include: membershipInclude,
  })
}

export async function updateMembershipRole(
  headers: Headers,
  input: z.infer<typeof UpdateMembershipRoleSchema>,
) {
  await endpointAuth.admin(headers)
  return db.membership.update({
    where: { id: input.membershipId },
    data: { role: input.role },
    include: membershipInclude,
  })
}

export async function deleteMembership(
  headers: Headers,
  input: z.infer<typeof DeleteMembershipSchema>,
) {
  await endpointAuth.admin(headers)
  return db.membership.delete({
    where: { id: input.membershipId },
    include: membershipInclude,
  })
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

  const { userId } = await db.membership.findFirstOrThrow({
    where: { id: input.membershipId },
    select: { userId: true },
  })
  await membershipUpdateSession(userId)

  return db.membership.deleteMany({ where: { id: input.membershipId } })
}

export async function updateProjectMembershipRole(
  headers: Headers,
  input: z.infer<typeof UpdateProjectMembershipRoleSchema>,
) {
  const session = await endpointAuth.session(headers)
  await authorizeProjectMemberByProjectSlug(session, input.projectSlug, editorRoles)

  const updated = await db.membership.update({
    where: { id: input.membershipId },
    data: { role: input.role },
  })
  await membershipUpdateSession(updated.userId)
  return updated
}
