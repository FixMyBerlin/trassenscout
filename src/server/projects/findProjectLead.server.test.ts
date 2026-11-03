import { beforeEach, describe, expect, test, vi } from "vitest"
import { authMessages, AuthorizationError } from "@/src/shared/auth/errors"
import {
  assertProjectLeadOrAdmin,
  findProjectLead,
  isProjectLeadOrAdmin,
} from "./findProjectLead.server"

const mocks = vi.hoisted(() => ({ findUser: vi.fn() }))

vi.mock("@/src/server/db.server", () => ({
  default: { user: { findFirst: (...args: unknown[]) => mocks.findUser(...args) } },
}))

beforeEach(() => {
  vi.clearAllMocks()
  mocks.findUser.mockResolvedValue({ id: 7, email: "brit@example.org" })
})

describe("findProjectLead", () => {
  test("only finds the Projektleitung while they are an editor of the project", async () => {
    await expect(findProjectLead(1)).resolves.toEqual({ id: 7, email: "brit@example.org" })
    expect(mocks.findUser).toHaveBeenCalledWith({
      where: {
        projectsLed: { some: { id: 1 } },
        memberships: { some: { projectId: 1, role: "EDITOR" } },
      },
      select: { id: true, email: true },
    })
  })
})

describe("isProjectLeadOrAdmin", () => {
  test("admins pass without a lookup", async () => {
    await expect(
      isProjectLeadOrAdmin({ projectId: 1, userId: 3, membershipRole: null }),
    ).resolves.toBe(true)
    expect(mocks.findUser).not.toHaveBeenCalled()
  })

  test("the Projektleitung passes, other editors don't", async () => {
    await expect(
      isProjectLeadOrAdmin({ projectId: 1, userId: 7, membershipRole: "EDITOR" }),
    ).resolves.toBe(true)
    await expect(
      isProjectLeadOrAdmin({ projectId: 1, userId: 8, membershipRole: "EDITOR" }),
    ).resolves.toBe(false)
  })

  test("a Projektleitung who is only a viewer doesn't pass", async () => {
    await expect(
      isProjectLeadOrAdmin({ projectId: 1, userId: 7, membershipRole: "VIEWER" }),
    ).resolves.toBe(false)
    expect(mocks.findUser).not.toHaveBeenCalled()
  })

  test("refusals say the user has no permission, not that they are logged out", async () => {
    const refusal = assertProjectLeadOrAdmin({ projectId: 1, userId: 8, membershipRole: "EDITOR" })

    await expect(refusal).rejects.toBeInstanceOf(AuthorizationError)
    await expect(refusal).rejects.toThrow(authMessages.forbiddenAccess)
  })
})
