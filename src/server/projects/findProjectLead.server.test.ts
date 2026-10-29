import { describe, expect, test, vi } from "vitest"
import { findProjectLead } from "./findProjectLead.server"

const mocks = vi.hoisted(() => ({ findUser: vi.fn() }))

vi.mock("@/src/server/db.server", () => ({
  default: { user: { findFirst: (...args: unknown[]) => mocks.findUser(...args) } },
}))

describe("findProjectLead", () => {
  test("only finds the Projektleitung while they are an editor of the project", async () => {
    mocks.findUser.mockResolvedValue({ id: 7, email: "brit@example.org" })

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
