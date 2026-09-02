import { beforeEach, describe, expect, test, vi } from "vitest"
import { UserRoleEnum } from "@/src/prisma/generated/browser"

const mockPaginate = vi.fn()
const mockProjectRole = vi.fn()
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
    projectRole: mockProjectRole,
  },
}))

vi.mock("@/src/server/utils/paginate.server", () => ({
  paginate: mockPaginate,
}))

const headers = new Headers()

describe("getProjectLogEntries", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDb.membership.findMany.mockResolvedValue([{ projectId: 5, userId: 1 }])
    mockProjectRole.mockResolvedValue({
      session: { role: UserRoleEnum.USER, userId: 99 },
    })
  })

  test("returns stable shape for non-admins with null changes and user", async () => {
    mockPaginate.mockResolvedValue({
      items: [
        {
          id: 1,
          action: "CREATE",
          message: "Former Member wurde dem Projektteam rs23 hinzugefügt.",
          createdAt: new Date(),
        },
      ],
    })

    const { getProjectLogEntries } = await import("./logEntries.server")
    const result = await getProjectLogEntries(headers, {
      projectSlug: "rs23",
      projectId: 5,
    })

    const paginateArgs = mockPaginate.mock.calls[0]?.[0]
    await paginateArgs.query({ skip: 0, take: 50 })
    expect(mockDb.logEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          id: true,
          action: true,
          message: true,
          createdAt: true,
        }),
      }),
    )

    expect(result.isAdmin).toBe(false)
    expect(result.logEntries[0]).toEqual({
      id: 1,
      action: "CREATE",
      message: "Former Member wurde dem Projektteam rs23 hinzugefügt.",
      createdAt: result.logEntries[0]?.createdAt,
      changes: null,
      user: null,
    })
    expect(mockDb.membership.findMany).not.toHaveBeenCalled()
  })

  test("returns changes and user for admins without rewriting messages", async () => {
    mockProjectRole.mockResolvedValue({
      session: { role: UserRoleEnum.ADMIN, userId: 99 },
    })
    mockDb.membership.findMany.mockResolvedValue([{ projectId: 5, userId: 1 }])

    mockPaginate.mockResolvedValue({
      items: [
        {
          id: 2,
          action: "UPDATE",
          message: "Former Member wurde zugewiesen.",
          createdAt: new Date(),
          changes: [{ path: ["assignedToId"], value: 9, oldValue: null }],
          user: { id: 1, firstName: "Current", lastName: "Editor" },
        },
      ],
    })

    const { getProjectLogEntries } = await import("./logEntries.server")
    const result = await getProjectLogEntries(headers, {
      projectSlug: "rs23",
      projectId: 5,
    })

    const entry = result.logEntries[0]

    expect(result.isAdmin).toBe(true)
    expect(entry?.changes).toEqual([{ path: ["assignedToId"], value: 9, oldValue: null }])
    expect(entry?.message).toBe("Former Member wurde zugewiesen.")
    expect(entry?.user).toEqual({
      id: 1,
      firstName: "Current",
      lastName: "Editor",
    })
    expect(mockDb.membership.findMany).not.toHaveBeenCalled()
  })
})
