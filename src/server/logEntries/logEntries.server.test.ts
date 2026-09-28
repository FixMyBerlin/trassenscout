import { beforeEach, describe, expect, test, vi } from "vitest"
import { LogLevelActionEnum, UserRoleEnum } from "@/src/prisma/generated/browser"

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
    expect(mockDb.logEntry.findMany.mock.calls[0]?.[0]?.orderBy).toEqual([
      { createdAt: "desc" },
      { id: "desc" },
    ])
    expect(mockDb.logEntry.findMany.mock.calls[0]?.[0]?.take).toBe(101)
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
    expect(whereOf()).not.toHaveProperty("AND")
  })

  test("pages strictly older than the cursor and reports another page", async () => {
    mockSession.mockResolvedValue({ userId: 99, role: UserRoleEnum.ADMIN })
    const createdAt = new Date("2026-01-15T12:00:00.000Z")
    mockDb.logEntry.findMany.mockResolvedValue(
      Array.from({ length: 101 }, (_, index) => ({
        id: 200 - index,
        action: LogLevelActionEnum.UPDATE,
        message: null,
        createdAt: new Date(createdAt.getTime() - index * 1000),
        project: { slug: "rs23" },
      })),
    )
    const { getLogEntries } = await import("./logEntries.server")

    const result = await getLogEntries(headers, {
      cursor: { createdAt: "2026-02-01T00:00:00.000Z", id: 40 },
    })

    const cursorAt = new Date("2026-02-01T00:00:00.000Z")
    expect(whereOf()).toEqual({
      AND: [
        { project: { is: {} } },
        {
          OR: [{ createdAt: { lt: cursorAt } }, { createdAt: cursorAt, id: { lt: 40 } }],
        },
      ],
    })
    expect(result.logEntries).toHaveLength(100)
    expect(result.nextCursor).toEqual({
      createdAt: result.logEntries.at(-1)?.createdAt.toISOString(),
      id: result.logEntries.at(-1)?.id,
    })
  })

  test("omits the next cursor when the page is not full", async () => {
    mockSession.mockResolvedValue({ userId: 99, role: UserRoleEnum.ADMIN })
    mockDb.logEntry.findMany.mockResolvedValue([
      {
        id: 1,
        action: LogLevelActionEnum.CREATE,
        message: null,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        project: { slug: "rs23" },
      },
    ])
    const { getLogEntries } = await import("./logEntries.server")

    const result = await getLogEntries(headers, {})

    expect(result.nextCursor).toBeNull()
  })

  test("keeps the months bound and the cursor in separate AND clauses", async () => {
    mockSession.mockResolvedValue({ userId: 99, role: UserRoleEnum.ADMIN })
    const { getLogEntries } = await import("./logEntries.server")

    await getLogEntries(headers, {
      months: 3,
      cursor: { createdAt: "2026-02-01T00:00:00.000Z", id: 8 },
    })

    const [filter, cursor] = whereOf().AND
    expect(filter.createdAt.gte).toBeInstanceOf(Date)
    expect(cursor.OR[1]).toEqual({
      createdAt: new Date("2026-02-01T00:00:00.000Z"),
      id: { lt: 8 },
    })
  })
})

describe("getLogEntriesForExport", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession.mockResolvedValue({ userId: 99, role: UserRoleEnum.ADMIN })
    mockDb.logEntry.findMany.mockResolvedValue([])
  })

  test("uses the same filter without a cursor and caps the file", async () => {
    const { getLogEntriesForExport } = await import("./logEntries.server")

    await getLogEntriesForExport(headers, { projectSlug: "rs23", months: 3 })

    const query = mockDb.logEntry.findMany.mock.calls[0]?.[0]
    expect(query.where.project).toEqual({ is: { slug: "rs23" } })
    expect(query.where.createdAt.gte).toBeInstanceOf(Date)
    expect(query.where).not.toHaveProperty("AND")
    expect(query.take).toBe(50_000)
  })
})
