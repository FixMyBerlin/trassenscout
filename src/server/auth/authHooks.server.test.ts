import { beforeEach, describe, expect, test, vi } from "vitest"
import { verifyPassword } from "@/src/server/auth/passwordHashing.server"

const mockDb = {
  account: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  user: {
    update: vi.fn(),
  },
  $transaction: vi.fn(),
}

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

// Real legacy hash (see passwordHashing.server.test.ts)
const legacyHash =
  "JGFyZ29uMmlkJHY9MTkkbT02NTUzNix0PTIscD0xJDdBbDc3TmVUVmp6VDFCSDVaS0lGMnckTnNwMDJjbGFnMUxYdUVZSllrbDAyQ0ExTTZKUy93RkUrZVF6VE1ndGRtWQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
const legacyPassword = "test-password-1234"

describe("rehashLegacyPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("rewrites a legacy hash as PHC and clears the legacy column", async () => {
    const { rehashLegacyPassword } = await import("@/src/server/auth/authHooks.server")
    mockDb.account.findFirst.mockResolvedValue({ id: 7, password: legacyHash })

    await rehashLegacyPassword(42, legacyPassword)

    expect(mockDb.$transaction).toHaveBeenCalledOnce()
    const accountUpdate = mockDb.account.update.mock.calls[0]![0]
    expect(accountUpdate.where).toEqual({ id: 7 })
    expect(accountUpdate.data.password).toMatch(/^\$argon2id\$/)
    // The new hash must still verify against the original password
    await expect(verifyPassword(accountUpdate.data.password, legacyPassword)).resolves.toBe(true)

    const userUpdate = mockDb.user.update.mock.calls[0]![0]
    expect(userUpdate.where).toEqual({ id: 42 })
    expect(userUpdate.data.hashedPassword).toBeNull()
    expect(userUpdate.data.passwordHashMigratedAt).toBeInstanceOf(Date)
  })

  test("does nothing for an already migrated (PHC) hash", async () => {
    const { rehashLegacyPassword } = await import("@/src/server/auth/authHooks.server")
    mockDb.account.findFirst.mockResolvedValue({
      id: 7,
      password: "$argon2id$v=19$m=65536,t=2,p=1$somesalt$somehash",
    })

    await rehashLegacyPassword(42, legacyPassword)

    expect(mockDb.$transaction).not.toHaveBeenCalled()
  })

  test("does nothing when the password does not match the stored hash", async () => {
    const { rehashLegacyPassword } = await import("@/src/server/auth/authHooks.server")
    mockDb.account.findFirst.mockResolvedValue({ id: 7, password: legacyHash })

    await rehashLegacyPassword(42, "wrong-password")

    expect(mockDb.$transaction).not.toHaveBeenCalled()
  })

  test("does nothing without a credential account or stored password", async () => {
    const { rehashLegacyPassword } = await import("@/src/server/auth/authHooks.server")

    mockDb.account.findFirst.mockResolvedValue(null)
    await rehashLegacyPassword(42, legacyPassword)

    mockDb.account.findFirst.mockResolvedValue({ id: 7, password: null })
    await rehashLegacyPassword(42, legacyPassword)

    expect(mockDb.$transaction).not.toHaveBeenCalled()
  })
})
