import { beforeEach, describe, expect, test, vi } from "vitest"
import { getProjectRecords } from "./projectRecords.server"

const { mockDb, mockEndpointAuth } = vi.hoisted(() => ({
  mockDb: {
    project: { findUnique: vi.fn() },
    projectRecord: { findMany: vi.fn() },
    membership: { findMany: vi.fn() },
  },
  mockEndpointAuth: { projectRole: vi.fn() },
}))

vi.mock("@/src/server/db.server", () => ({ default: mockDb }))
vi.mock("@/src/server/auth/endpointAuth.server", () => ({ endpointAuth: mockEndpointAuth }))

describe("project record list order", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEndpointAuth.projectRole.mockResolvedValue({
      projectId: 1,
      session: { userId: "1", role: "USER" },
    })
    mockDb.project.findUnique.mockResolvedValue({ id: 1, aiEnabled: false })
    mockDb.projectRecord.findMany.mockResolvedValue([])
    mockDb.membership.findMany.mockResolvedValue([])
  })

  test("puts undated records after dated ones, newest first within a date", async () => {
    await getProjectRecords(new Headers(), { projectSlug: "lb" })

    expect(mockDb.projectRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ date: { sort: "desc", nulls: "last" } }, { id: "desc" }],
      }),
    )
  })
})
