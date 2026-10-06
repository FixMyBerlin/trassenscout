import { beforeEach, describe, expect, test, vi } from "vitest"

const mockDb = {
  project: { findMany: vi.fn(), update: vi.fn() },
}
const mockCreateLogEntry = vi.fn()

vi.mock("@/src/server/db.server", () => ({ default: mockDb }))
vi.mock("@/src/server/logEntries/create/createLogEntry", () => ({
  createLogEntry: mockCreateLogEntry,
}))

describe("setExternalShareEnabled", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("only touches projects whose switch actually changes", async () => {
    const { setExternalShareEnabled } = await import("./externalShareToken.server")
    mockDb.project.findMany.mockResolvedValue([])

    await setExternalShareEnabled({ projectSlugs: ["rs23"], enabled: true, userId: 1 })

    expect(mockDb.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: { in: ["rs23"] }, externalShareEnabled: false } }),
    )
    expect(mockDb.project.update).not.toHaveBeenCalled()
  })

  test("mints the secret link on the first enable", async () => {
    const { setExternalShareEnabled } = await import("./externalShareToken.server")
    mockDb.project.findMany.mockResolvedValue([{ id: 3, externalShareToken: null }])

    await setExternalShareEnabled({ projectSlugs: ["rs23"], enabled: true, userId: 1 })

    const data = mockDb.project.update.mock.calls[0]?.[0]?.data
    expect(data.externalShareEnabled).toBe(true)
    expect(data.externalShareToken).toMatch(/^[\w-]{43}$/)
    expect(mockCreateLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 3,
        message: "Externe Freigabe wurde aktiviert.",
        previousRecord: { externalShareEnabled: false },
        updatedRecord: { externalShareEnabled: true },
      }),
    )
  })

  test("keeps an existing link when enabling again, so partners' links still work", async () => {
    const { setExternalShareEnabled } = await import("./externalShareToken.server")
    mockDb.project.findMany.mockResolvedValue([{ id: 3, externalShareToken: "existing" }])

    await setExternalShareEnabled({ projectSlugs: ["rs23"], enabled: true, userId: 1 })

    expect(mockDb.project.update.mock.calls[0]?.[0]?.data).toEqual({ externalShareEnabled: true })
  })

  test("disabling switches the page off without discarding the link", async () => {
    const { setExternalShareEnabled } = await import("./externalShareToken.server")
    mockDb.project.findMany.mockResolvedValue([{ id: 3, externalShareToken: "existing" }])

    await setExternalShareEnabled({ projectSlugs: ["rs23"], enabled: false, userId: 1 })

    expect(mockDb.project.update.mock.calls[0]?.[0]?.data).toEqual({ externalShareEnabled: false })
    expect(mockCreateLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Externe Freigabe wurde deaktiviert." }),
    )
  })
})
