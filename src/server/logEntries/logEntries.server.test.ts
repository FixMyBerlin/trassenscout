import { beforeEach, describe, expect, test, vi } from "vitest"
import { UserRoleEnum } from "@/src/prisma/generated/browser"

const mockSession = vi.fn()
const mockDb = {
  membership: {
    findMany: vi.fn().mockResolvedValue([{ userId: 1 }]),
  },
  logEntry: {
    count: vi.fn().mockResolvedValue(1),
    findMany: vi.fn().mockResolvedValue([]),
  },
}

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: {
    session: mockSession,
  },
}))

const headers = new Headers()

describe("getLogEntries", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession.mockResolvedValue({ userId: 99, role: UserRoleEnum.USER })
    mockDb.logEntry.findMany.mockResolvedValue([])
  })

  const whereOf = () => mockDb.logEntry.findMany.mock.calls[0]?.[0]?.where
  const selectOf = () => mockDb.logEntry.findMany.mock.calls[0]?.[0]?.select

  test("limits a non-admin to the projects they edit with the log switched on", async () => {
    const { getLogEntries } = await import("./logEntries.server")

    await getLogEntries(headers, {})

    expect(whereOf().project).toEqual({
      is: {
        showLogEntries: true,
        memberships: { some: { userId: 99, role: { in: ["EDITOR"] } } },
      },
    })
  })

  test("leaves an admin every project and adds the columns only they see", async () => {
    mockSession.mockResolvedValue({ userId: 99, role: UserRoleEnum.ADMIN })
    const { getLogEntries } = await import("./logEntries.server")

    await getLogEntries(headers, {})

    expect(whereOf().project).toEqual({ is: {} })
    expect(selectOf()).toEqual(expect.objectContaining({ changes: true }))
  })

  test("withholds changes and user from a non-admin", async () => {
    const { getLogEntries } = await import("./logEntries.server")

    await getLogEntries(headers, {})

    expect(selectOf()).not.toHaveProperty("changes")
    expect(selectOf()).not.toHaveProperty("user")
  })

  test("narrows to one project and sorts by date, not by project", async () => {
    mockSession.mockResolvedValue({ userId: 99, role: UserRoleEnum.ADMIN })
    const { getLogEntries } = await import("./logEntries.server")

    await getLogEntries(headers, { projectSlug: "rs23" })

    expect(whereOf().project).toEqual({ is: { slug: "rs23" } })
    expect(mockDb.logEntry.findMany.mock.calls[0]?.[0]?.orderBy).toEqual({ createdAt: "desc" })
  })

  test("counts the time window back from now", async () => {
    mockSession.mockResolvedValue({ userId: 99, role: UserRoleEnum.ADMIN })
    const { getLogEntries } = await import("./logEntries.server")

    await getLogEntries(headers, { months: 3 })

    const cutoff = whereOf().createdAt.gte as Date
    const expected = new Date()
    expected.setMonth(expected.getMonth() - 3)
    expect(Math.abs(cutoff.getTime() - expected.getTime())).toBeLessThan(5_000)
  })

  test("asks for no window when none is given", async () => {
    mockSession.mockResolvedValue({ userId: 99, role: UserRoleEnum.ADMIN })
    const { getLogEntries } = await import("./logEntries.server")

    await getLogEntries(headers, {})

    expect(whereOf()).not.toHaveProperty("createdAt")
  })
})
