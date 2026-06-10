import { beforeEach, describe, expect, test, vi } from "vitest"
import { AuthenticationError } from "@/src/shared/auth/errors"

const mockDb = {
  invite: {
    findFirst: vi.fn(),
  },
}

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

describe("getInvite", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("returns invite for valid pending token and email", async () => {
    const { getInvite } = await import("@/src/server/auth/shared/getInvite")
    const invite = { id: 1, token: "token", email: "user@example.com", status: "PENDING" }
    mockDb.invite.findFirst.mockResolvedValue(invite)

    await expect(getInvite("token", "User@Example.com")).resolves.toEqual(invite)
    expect(mockDb.invite.findFirst).toHaveBeenCalledWith({
      where: { token: "token", email: "user@example.com", status: "PENDING" },
    })
  })

  test("throws AuthenticationError for invalid invite", async () => {
    const { getInvite } = await import("@/src/server/auth/shared/getInvite")
    mockDb.invite.findFirst.mockResolvedValue(null)

    await expect(getInvite("bad-token", "user@example.com")).rejects.toBeInstanceOf(
      AuthenticationError,
    )
  })

  test("returns null when invite token is missing", async () => {
    const { getInvite } = await import("@/src/server/auth/shared/getInvite")

    await expect(getInvite(null, "user@example.com")).resolves.toBeNull()
    expect(mockDb.invite.findFirst).not.toHaveBeenCalled()
  })
})
