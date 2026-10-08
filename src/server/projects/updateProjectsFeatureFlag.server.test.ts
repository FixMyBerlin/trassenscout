import { beforeEach, describe, expect, test, vi } from "vitest"
import { AuthorizationError } from "@/src/shared/auth/errors"
import { updateProjectsFeatureFlag } from "./projects.server"

const { mockAdmin, mockUpdateMany, mockSetExternalShareEnabled } = vi.hoisted(() => ({
  mockAdmin: vi.fn(),
  mockUpdateMany: vi.fn(),
  mockSetExternalShareEnabled: vi.fn(),
}))

vi.mock("@/src/server/auth/endpointAuth.server", () => ({ endpointAuth: { admin: mockAdmin } }))
vi.mock("@/src/server/db.server", () => ({
  default: { project: { updateMany: mockUpdateMany } },
}))
vi.mock("@/src/server/externalShare/_utils/externalShareToken.server", () => ({
  setExternalShareEnabled: mockSetExternalShareEnabled,
}))

const input = { projectSlugs: ["rs23"], key: "externalShareEnabled" as const, enabled: true }

describe("updateProjectsFeatureFlag", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAdmin.mockResolvedValue({ userId: "1", role: "ADMIN" })
  })

  test("rejects a non-admin before switching anything", async () => {
    mockAdmin.mockRejectedValue(new AuthorizationError())

    await expect(updateProjectsFeatureFlag(new Headers(), input)).rejects.toBeInstanceOf(
      AuthorizationError,
    )
    expect(mockSetExternalShareEnabled).not.toHaveBeenCalled()
    expect(mockUpdateMany).not.toHaveBeenCalled()
  })

  test("switches external sharing through the helper that creates the link and logs", async () => {
    await updateProjectsFeatureFlag(new Headers(), input)

    expect(mockSetExternalShareEnabled).toHaveBeenCalledWith({
      projectSlugs: ["rs23"],
      enabled: true,
      userId: 1,
    })
    expect(mockUpdateMany).not.toHaveBeenCalled()
  })
})
