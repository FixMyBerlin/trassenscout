import { beforeEach, describe, expect, test, vi } from "vitest"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import type { AppSession } from "@/src/server/auth/session.server"
import { AuthenticationError } from "@/src/shared/auth/errors"

const mockTx = {
  invite: {
    findMany: vi.fn(),
    updateMany: vi.fn(),
  },
  membership: {
    upsert: vi.fn(),
  },
}

const mockDb = {
  $transaction: vi.fn(async (callback: (tx: typeof mockTx) => Promise<unknown>) =>
    callback(mockTx),
  ),
  user: {
    findUniqueOrThrow: vi.fn(),
  },
}

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

vi.mock("@/src/server/auth/shared/createInviteLogEntry", () => ({
  createInviteLogEntry: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("@/src/server/auth/shared/notifyEditorsAboutNewMembership", () => ({
  notifyEditorsAboutNewMembership: vi.fn().mockResolvedValue(undefined),
}))

const session = {
  userId: "7",
  role: UserRoleEnum.USER,
  user: {
    id: "7",
    email: "invitee@example.com",
    emailVerified: true,
    name: "Invitee",
    createdAt: new Date(),
    updatedAt: new Date(),
    additionalFields: {
      role: UserRoleEnum.USER,
    },
  },
} satisfies AppSession

describe("acceptInviteForSession", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("accepts invite and returns project slug", async () => {
    const { acceptInviteForSession } = await import("@/src/server/auth/acceptInvite.server")

    mockTx.invite.findMany.mockResolvedValue([
      {
        email: "invitee@example.com",
        id: 1,
        project: { id: 10, slug: "rs23", subTitle: null },
        projectId: 10,
        role: "VIEWER",
        status: "PENDING",
      },
    ])
    mockTx.membership.upsert.mockResolvedValue({})
    mockTx.invite.updateMany.mockResolvedValue({ count: 1 })
    mockDb.user.findUniqueOrThrow.mockResolvedValue({
      id: 7,
      email: "invitee@example.com",
      firstName: "Invitee",
      lastName: "User",
    })

    await expect(acceptInviteForSession("invite-token", session)).resolves.toEqual({
      accepted: true,
      projectSlugs: ["rs23"],
    })

    expect(mockTx.membership.upsert).toHaveBeenCalledTimes(1)
    expect(mockTx.invite.updateMany).toHaveBeenCalledWith({
      where: { id: { in: [1] } },
      data: { status: "ACCEPTED" },
    })
  })

  test("accepts batch invite and returns project slugs", async () => {
    const { acceptInviteForSession } = await import("@/src/server/auth/acceptInvite.server")

    mockTx.invite.findMany.mockResolvedValue([
      {
        id: 1,
        projectId: 10,
        role: "VIEWER",
        email: "invitee@example.com",
        status: "PENDING",
        project: { id: 10, slug: "rs23", subTitle: null },
      },
      {
        id: 2,
        projectId: 11,
        role: "EDITOR",
        email: "invitee@example.com",
        status: "PENDING",
        project: { id: 11, slug: "rs24", subTitle: null },
      },
    ])
    mockTx.membership.upsert.mockResolvedValue({})
    mockTx.invite.updateMany.mockResolvedValue({ count: 2 })
    mockDb.user.findUniqueOrThrow.mockResolvedValue({
      id: 7,
      email: "invitee@example.com",
      firstName: "Invitee",
      lastName: "User",
    })

    await expect(acceptInviteForSession("invite-token", session)).resolves.toEqual({
      accepted: true,
      projectSlugs: ["rs23", "rs24"],
    })

    expect(mockTx.membership.upsert).toHaveBeenCalledTimes(2)
    expect(mockTx.invite.updateMany).toHaveBeenCalledWith({
      where: { id: { in: [1, 2] } },
      data: { status: "ACCEPTED" },
    })
  })

  test("throws AuthenticationError when invite is invalid", async () => {
    const { acceptInviteForSession } = await import("@/src/server/auth/acceptInvite.server")
    mockTx.invite.findMany.mockResolvedValue([])

    await expect(acceptInviteForSession("bad-token", session)).rejects.toBeInstanceOf(
      AuthenticationError,
    )
  })

  test("returns accepted false when invite token is missing", async () => {
    const { acceptInviteForSession } = await import("@/src/server/auth/acceptInvite.server")

    await expect(acceptInviteForSession(undefined, session)).resolves.toEqual({ accepted: false })
    expect(mockDb.$transaction).not.toHaveBeenCalled()
  })
})
