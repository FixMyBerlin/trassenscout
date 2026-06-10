import { beforeEach, describe, expect, test, vi } from "vitest"

const mockDb = {
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

describe("authPasswordReset.server", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("isPasswordResetRequired returns true when user flag is set", async () => {
    const { isPasswordResetRequired } = await import("@/src/server/auth/authPasswordReset.server")
    mockDb.user.findUnique.mockResolvedValue({ passwordResetRequired: true })

    await expect(isPasswordResetRequired("User@Example.com")).resolves.toBe(true)
    expect(mockDb.user.findUnique).toHaveBeenCalledWith({
      where: { email: "user@example.com" },
      select: { passwordResetRequired: true },
    })
  })

  test("isPasswordResetRequired returns false when user is missing", async () => {
    const { isPasswordResetRequired } = await import("@/src/server/auth/authPasswordReset.server")
    mockDb.user.findUnique.mockResolvedValue(null)

    await expect(isPasswordResetRequired("missing@example.com")).resolves.toBe(false)
  })

  test("clearPasswordResetRequired clears the user flag", async () => {
    const { clearPasswordResetRequired } =
      await import("@/src/server/auth/authPasswordReset.server")

    await clearPasswordResetRequired(42)

    expect(mockDb.user.update).toHaveBeenCalledWith({
      where: { id: 42 },
      data: { passwordResetRequired: false },
    })
  })
})
