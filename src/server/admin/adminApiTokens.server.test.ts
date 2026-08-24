import { createHash } from "node:crypto"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { LOCAL_DEV_ADMIN_API_TOKEN } from "@/prisma/seeds/adminApiToken.const"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { ADMIN_API_TOKEN_PREFIX } from "@/src/server/admin/adminApiTokenPrefix.const"

const mockDb = {
  adminApiToken: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

describe("adminApiTokens", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(Math, "random").mockRestore()
  })

  test("LOCAL_DEV_ADMIN_API_TOKEN uses the admin prefix and SHA-256 hash", async () => {
    const { hashAdminApiToken } = await import("@/src/server/admin/adminApiTokens.server")
    expect(LOCAL_DEV_ADMIN_API_TOKEN.startsWith(ADMIN_API_TOKEN_PREFIX)).toBe(true)
    expect(hashAdminApiToken(LOCAL_DEV_ADMIN_API_TOKEN)).toBe(
      createHash("sha256").update(LOCAL_DEV_ADMIN_API_TOKEN).digest("hex"),
    )
  })

  test("verifyAdminApiToken rejects unknown prefix", async () => {
    const { verifyAdminApiToken } = await import("@/src/server/admin/adminApiTokens.server")
    await expect(verifyAdminApiToken("wrong_prefix_token")).resolves.toBeNull()
  })

  test("verifyAdminApiToken rejects revoked token", async () => {
    const { verifyAdminApiToken, hashAdminApiToken } =
      await import("@/src/server/admin/adminApiTokens.server")
    const token = `${ADMIN_API_TOKEN_PREFIX}revoked`
    mockDb.adminApiToken.findUnique.mockResolvedValue({
      id: "tok-1",
      createdById: 1,
      revokedAt: new Date(),
      lastUsedAt: null,
      createdBy: { role: UserRoleEnum.ADMIN },
    })

    const result = await verifyAdminApiToken(token)
    expect(result).toBeNull()
    expect(mockDb.adminApiToken.findUnique).toHaveBeenCalledWith({
      where: { hashedToken: hashAdminApiToken(token) },
      select: expect.any(Object),
    })
  })

  test("verifyAdminApiToken rejects demoted admin owner", async () => {
    const { verifyAdminApiToken } = await import("@/src/server/admin/adminApiTokens.server")
    const token = `${ADMIN_API_TOKEN_PREFIX}demoted`
    mockDb.adminApiToken.findUnique.mockResolvedValue({
      id: "tok-2",
      createdById: 2,
      revokedAt: null,
      lastUsedAt: null,
      createdBy: { role: UserRoleEnum.USER },
    })

    await expect(verifyAdminApiToken(token)).resolves.toBeNull()
  })

  test("verifyAdminApiToken accepts active admin token", async () => {
    const { verifyAdminApiToken } = await import("@/src/server/admin/adminApiTokens.server")
    const token = `${ADMIN_API_TOKEN_PREFIX}active`
    mockDb.adminApiToken.findUnique.mockResolvedValue({
      id: "tok-3",
      createdById: 3,
      revokedAt: null,
      lastUsedAt: null,
      createdBy: { role: UserRoleEnum.ADMIN },
    })
    mockDb.adminApiToken.update.mockResolvedValue({})

    await expect(verifyAdminApiToken(token)).resolves.toEqual({
      tokenId: "tok-3",
      createdById: 3,
    })
  })

  test("revokeAdminApiToken sets revokedAt", async () => {
    const { revokeAdminApiToken } = await import("@/src/server/admin/adminApiTokens.server")
    mockDb.adminApiToken.update.mockResolvedValue({ id: "tok-4" })

    await revokeAdminApiToken("tok-4")
    expect(mockDb.adminApiToken.update).toHaveBeenCalledWith({
      where: { id: "tok-4" },
      data: { revokedAt: expect.any(Date) },
      select: { id: true },
    })
  })
})
