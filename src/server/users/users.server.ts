import type { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import { UpdateUserSchema } from "@/src/shared/auth/schemas"

export async function getCurrentUser(headers: Headers) {
  const session = await endpointAuth.session(headers)
  return db.user.findUniqueOrThrow({
    where: { id: Number(session.userId) },
    select: {
      email: true,
      firstName: true,
      id: true,
      institution: true,
      lastName: true,
      memberships: {
        select: {
          role: true,
          project: {
            select: {
              slug: true,
            },
          },
        },
      },
      phone: true,
      role: true,
    },
  })
}

export async function updateCurrentUser(headers: Headers, input: z.infer<typeof UpdateUserSchema>) {
  const session = await endpointAuth.session(headers)
  return db.user.update({
    where: { id: Number(session.userId) },
    data: input,
    select: {
      email: true,
      firstName: true,
      id: true,
      institution: true,
      lastName: true,
      memberships: {
        select: {
          role: true,
          project: {
            select: {
              slug: true,
            },
          },
        },
      },
      phone: true,
      role: true,
    },
  })
}

export async function getUsersAdmin(headers: Headers) {
  await endpointAuth.admin(headers)

  const users = await db.user.findMany({
    orderBy: { id: "asc" },
    take: 100,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  })

  return { users }
}

const userWithMembershipsSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  memberships: {
    select: {
      id: true,
      role: true,
      project: {
        select: {
          id: true,
          slug: true,
        },
      },
    },
  },
} as const

const userWithMembershipsDetailSelect = {
  ...userWithMembershipsSelect,
  phone: true,
  institution: true,
  emailVerified: true,
  createdAt: true,
} as const

const userInviteSelect = {
  id: true,
  status: true,
  role: true,
  updatedAt: true,
  project: {
    select: {
      slug: true,
    },
  },
} as const

export async function getUsersWithMemberships(headers: Headers) {
  await endpointAuth.admin(headers)

  return db.user.findMany({
    orderBy: { id: "asc" },
    take: 100,
    select: userWithMembershipsSelect,
  })
}

export async function getUserWithMemberships(headers: Headers, input: { userId: number }) {
  await endpointAuth.admin(headers)

  const user = await db.user.findUniqueOrThrow({
    where: { id: input.userId },
    select: userWithMembershipsDetailSelect,
  })

  const invites = await db.invite.findMany({
    where: {
      email: user.email,
      status: { in: ["PENDING", "ACCEPTED"] },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    select: userInviteSelect,
  })

  return { ...user, invites }
}
