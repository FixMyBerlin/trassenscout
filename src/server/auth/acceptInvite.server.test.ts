import { beforeEach, describe, expect, test, vi } from "vitest"
import { UserRoleEnum } from "@/src/prisma/generated/client"
import type { AppSession } from "@/src/server/auth/session.server"
import { AuthenticationError } from "@/src/shared/auth/errors"

const mockTx = {
  invite: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  membership: {
    upsert: vi.fn(),
  },
  project: {
    findUnique: vi.fn(),
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
    const acceptedInvite = {
      id: 1,
      projectId: 10,
      email: "invitee@example.com",
      status: "ACCEPTED",
    }

    mockTx.invite.findFirst.mockResolvedValue({
      id: 1,
      projectId: 10,
      role: "VIEWER",
      email: "invitee@example.com",
      status: "PENDING",
    })
    mockTx.membership.upsert.mockResolvedValue({})
    mockTx.invite.update.mockResolvedValue(acceptedInvite)
    mockTx.project.findUnique.mockResolvedValue({ slug: "rs23" })
    mockDb.user.findUniqueOrThrow.mockResolvedValue({
      id: 7,
      email: "invitee@example.com",
      firstName: "Invitee",
      lastName: "User",
    })

    await expect(acceptInviteForSession("invite-token", session)).resolves.toEqual({
      accepted: true,
      projectId: 10,
      projectSlug: "rs23",
    })

    expect(mockTx.membership.upsert).toHaveBeenCalled()
    expect(mockTx.invite.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: "ACCEPTED" },
    })
  })

  test("throws AuthenticationError when invite is invalid", async () => {
    const { acceptInviteForSession } = await import("@/src/server/auth/acceptInvite.server")
    mockTx.invite.findFirst.mockResolvedValue(null)

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
