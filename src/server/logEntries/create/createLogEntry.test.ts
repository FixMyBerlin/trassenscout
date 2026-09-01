import { beforeEach, describe, expect, test, vi } from "vitest"

const mockCreate = vi.fn()

vi.mock("@/src/server/db.server", () => ({
  default: {
    logEntry: {
      create: mockCreate,
    },
  },
}))

vi.mock("@/src/server/projects/queries/getProjectIdBySlug.server", () => ({
  getProjectIdBySlug: vi.fn(),
}))

describe("createLogEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreate.mockResolvedValue({ id: 1 })
  })

  test("stores UPDATE changes without updatedAt", async () => {
    const { createLogEntry } = await import("./createLogEntry")

    await createLogEntry({
      action: "UPDATE",
      message: "Kontakt geändert",
      userId: 1,
      projectId: 10,
      previousRecord: { title: "Alt", updatedAt: new Date("2026-01-01T00:00:00.000Z") },
      updatedRecord: { title: "Neu", updatedAt: new Date("2026-01-02T00:00:00.000Z") },
    })

    expect(mockCreate).toHaveBeenCalledTimes(1)
    const changes = mockCreate.mock.calls[0]?.[0]?.data?.changes as { path: string[] }[]
    expect(changes.some((entry) => entry.path.join("") === "updatedAt")).toBe(false)
    expect(changes.some((entry) => entry.path.join("") === "title")).toBe(true)
  })

  test("skips UPDATE when only updatedAt changed", async () => {
    const { createLogEntry } = await import("./createLogEntry")

    await createLogEntry({
      action: "UPDATE",
      message: "Kontakt geändert",
      userId: 1,
      projectId: 10,
      previousRecord: { title: "Gleich", updatedAt: new Date("2026-01-01T00:00:00.000Z") },
      updatedRecord: { title: "Gleich", updatedAt: new Date("2026-01-02T00:00:00.000Z") },
    })

    expect(mockCreate).not.toHaveBeenCalled()
  })

  test("stores updatedRecord as changes for CREATE", async () => {
    const { createLogEntry } = await import("./createLogEntry")

    await createLogEntry({
      action: "CREATE",
      message: "Neuer Protokolleintrag erstellt.",
      userId: 1,
      projectId: 10,
      updatedRecord: { title: "Neu", assignedToId: 12, assignedToName: "Anna Müller" },
    })

    expect(mockCreate).toHaveBeenCalledTimes(1)
    expect(mockCreate.mock.calls[0]?.[0]?.data?.changes).toEqual({
      title: "Neu",
      assignedToId: 12,
      assignedToName: "Anna Müller",
    })
  })

  test("omits CREATE changes when updatedRecord is missing", async () => {
    const { createLogEntry } = await import("./createLogEntry")

    await createLogEntry({
      action: "CREATE",
      message: "Neuer Protokolleintrag erstellt.",
      userId: 1,
      projectId: 10,
    })

    expect(mockCreate).toHaveBeenCalledTimes(1)
    expect(mockCreate.mock.calls[0]?.[0]?.data?.changes).toBeUndefined()
  })
})
