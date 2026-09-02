import { beforeEach, describe, expect, test, vi } from "vitest"
import { MembershipRoleEnum } from "@/src/prisma/generated/browser"

const mockCreateLogEntry = vi.fn().mockResolvedValue(undefined)
const mockCleanup = vi.fn().mockResolvedValue(undefined)

const mockTx = {
  membership: {
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
}

const mockDb = {
  membership: {
    findUniqueOrThrow: vi.fn(),
    delete: vi.fn(),
  },
  $transaction: vi.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
}

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: {
    admin: vi.fn().mockResolvedValue({ userId: 1 }),
  },
}))

vi.mock("@/src/server/logEntries/create/createLogEntry", () => ({
  createLogEntry: mockCreateLogEntry,
}))

vi.mock("./cleanupMembershipDelete.server", () => ({
  cleanupBeforeMembershipDelete: mockCleanup,
}))

describe("deleteMembership", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDb.membership.findUniqueOrThrow.mockResolvedValue({
      id: 10,
      projectId: 5,
      userId: 3,
      role: MembershipRoleEnum.EDITOR,
      createdAt: new Date(),
      updatedAt: new Date(),
      project: { slug: "rs23" },
      user: { firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" },
    })
    mockTx.membership.delete.mockResolvedValue({ id: 10 })
  })

  test("runs cleanup and delete inside a transaction", async () => {
    const { deleteMembership } = await import("./memberships.server")

    await deleteMembership(new Headers(), { membershipId: 10 })

    expect(mockDb.$transaction).toHaveBeenCalled()
    expect(mockCleanup).toHaveBeenCalledWith({
      membershipId: 10,
      projectId: 5,
      userId: 3,
      client: mockTx,
    })
    expect(mockTx.membership.delete).toHaveBeenCalled()
    expect(mockCleanup.mock.invocationCallOrder[0]).toBeLessThan(
      mockTx.membership.delete.mock.invocationCallOrder[0] ?? 0,
    )
  })
})
