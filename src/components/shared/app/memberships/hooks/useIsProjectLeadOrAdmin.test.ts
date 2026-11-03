import { describe, expect, test } from "vitest"
import type { CurrentUser } from "@/src/server/users/types"
import { userIsProjectLeadOrAdmin } from "./useIsProjectLeadOrAdmin"

const user = (overrides: Partial<CurrentUser> = {}): CurrentUser => ({
  id: 7,
  email: "brit@example.org",
  firstName: "Brit",
  lastName: null,
  institution: null,
  phone: null,
  role: "USER",
  memberships: [{ project: { slug: "rs8" }, role: "EDITOR" }],
  ...overrides,
})
const project = { slug: "rs8", projectLeadId: 7 }

describe("userIsProjectLeadOrAdmin", () => {
  test("admins and the Projektleitung pass", () => {
    expect(userIsProjectLeadOrAdmin(user({ id: 3, role: "ADMIN", memberships: [] }), project)).toBe(
      true,
    )
    expect(userIsProjectLeadOrAdmin(user(), project)).toBe(true)
  })

  test("other editors and a Projektleitung who is only a viewer don't", () => {
    expect(userIsProjectLeadOrAdmin(user({ id: 8 }), project)).toBe(false)
    expect(
      userIsProjectLeadOrAdmin(
        user({ memberships: [{ project: { slug: "rs8" }, role: "VIEWER" }] }),
        project,
      ),
    ).toBe(false)
  })

  test("nobody passes before user and project are loaded", () => {
    expect(userIsProjectLeadOrAdmin(null, project)).toBe(false)
    expect(userIsProjectLeadOrAdmin(user(), undefined)).toBe(false)
  })
})
