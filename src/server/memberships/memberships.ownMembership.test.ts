import { beforeEach, describe, expect, test, vi } from "vitest"
import { authMessages } from "@/src/shared/auth/errors"
import { deleteProjectMembership, updateProjectMembershipRole } from "./memberships.server"

const { mockDb, mockSession, mockUpdateSession } = vi.hoisted(() => {
  const mockTx = { membership: { deleteMany: vi.fn() } }
  return {
    mockDb: {
      membership: { findFirstOrThrow: vi.fn(), update: vi.fn() },
      $transaction: vi.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
    },
    mockSession: vi.fn(),
    mockUpdateSession: vi.fn(),
  }
})

vi.mock("@/src/server/db.server", () => ({ default: mockDb }))
vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: { session: mockSession },
}))
vi.mock("../authorization/authorizeProjectMember.server", () => ({
  authorizeProjectMemberByProjectSlug: vi.fn(),
}))
vi.mock("./membershipUpdateSession", () => ({ membershipUpdateSession: mockUpdateSession }))
vi.mock("./cleanupMembershipDelete.server", () => ({ cleanupBeforeMembershipDelete: vi.fn() }))
vi.mock("@/src/server/logEntries/create/createLogEntry", () => ({ createLogEntry: vi.fn() }))

const headers = new Headers()

const membershipOf = (userId: number) => ({
  id: 10,
  userId,
  projectId: 5,
  role: "EDITOR",
  createdAt: new Date(),
  updatedAt: new Date(),
  user: { firstName: "Ada", lastName: "Lovelace", email: "ada@example.com", institution: null },
  project: { slug: "rs23" },
})

describe("team page membership changes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession.mockResolvedValue({ userId: "3", role: "USER" })
  })

  test("members cannot change their own role", async () => {
    mockDb.membership.findFirstOrThrow.mockResolvedValue(membershipOf(3))

    await expect(
      updateProjectMembershipRole(headers, {
        projectSlug: "rs23",
        membershipId: 10,
        role: "VIEWER",
      }),
    ).rejects.toThrow(authMessages.ownMembershipChange)
    expect(mockDb.membership.update).not.toHaveBeenCalled()
    expect(mockUpdateSession).not.toHaveBeenCalled()
  })

  test("members cannot remove themselves", async () => {
    mockDb.membership.findFirstOrThrow.mockResolvedValue(membershipOf(3))

    await expect(
      deleteProjectMembership(headers, { projectSlug: "rs23", membershipId: 10 }),
    ).rejects.toThrow(authMessages.ownMembershipChange)
    expect(mockDb.$transaction).not.toHaveBeenCalled()
    expect(mockUpdateSession).not.toHaveBeenCalled()
  })

  test("editors can still change the role of other members", async () => {
    mockDb.membership.findFirstOrThrow.mockResolvedValue(membershipOf(4))
    mockDb.membership.update.mockResolvedValue({ ...membershipOf(4), role: "VIEWER" })

    await updateProjectMembershipRole(headers, {
      projectSlug: "rs23",
      membershipId: 10,
      role: "VIEWER",
    })

    expect(mockDb.membership.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { role: "VIEWER" },
    })
  })
})
