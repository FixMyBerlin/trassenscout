import { beforeEach, describe, expect, test, vi } from "vitest"
import { findAdminOrProjectMember, isAdminOrProjectMember } from "./checkSenderApproval.server"

const mocks = vi.hoisted(() => ({ findUser: vi.fn() }))

vi.mock("@/src/server/db.server", () => ({
  default: { user: { findFirst: (...args: unknown[]) => mocks.findUser(...args) } },
}))

const queriedEmail = () => mocks.findUser.mock.calls[0]?.[0].where.email

describe("findAdminOrProjectMember", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.findUser.mockResolvedValue({ id: 4, email: "max@example.org" })
  })

  test("looks up admins and project members by the sender address", async () => {
    await expect(
      findAdminOrProjectMember({ projectId: 1, email: '"Max Beispiel" <Max@Example.org>' }),
    ).resolves.toEqual({ id: 4, email: "max@example.org" })

    expect(mocks.findUser).toHaveBeenCalledWith({
      where: {
        email: "max@example.org",
        OR: [{ role: "ADMIN" }, { memberships: { some: { projectId: 1 } } }],
      },
      select: { id: true, email: true },
    })
  })

  test("an address inside the display name is not the sender", async () => {
    await findAdminOrProjectMember({
      projectId: 1,
      email: '"Max <member@city.example>" <attacker@evil.example>',
    })

    expect(queriedEmail()).toBe("attacker@evil.example")
  })

  test("takes a bare address and skips senders without one", async () => {
    await findAdminOrProjectMember({ projectId: 1, email: "max@example.org" })
    expect(queriedEmail()).toBe("max@example.org")

    vi.clearAllMocks()
    await expect(findAdminOrProjectMember({ projectId: 1, email: null })).resolves.toBeNull()
    await expect(isAdminOrProjectMember({ projectId: 1, email: "Unbekannt" })).resolves.toBe(false)
    expect(mocks.findUser).not.toHaveBeenCalled()
  })
})
