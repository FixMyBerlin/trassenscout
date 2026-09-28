import { beforeEach, describe, expect, test, vi } from "vitest"
import { UserRoleEnum } from "@/src/prisma/generated/browser"

const mockSession = vi.fn()
const mockDb = {
  projectRecord: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
}

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: { session: mockSession },
}))

const headers = new Headers()

const listWhere = () => mockDb.projectRecord.findMany.mock.calls[0]?.[0]?.where
const countWhere = () => mockDb.projectRecord.count.mock.calls[0]?.[0]?.where

describe("getMyAssignedRecords", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession.mockResolvedValue({ userId: 99, role: UserRoleEnum.USER })
    mockDb.projectRecord.findMany.mockResolvedValue([])
    mockDb.projectRecord.count.mockResolvedValue(0)
  })

  test("hides a project the user has been removed from, even while still assigned", async () => {
    const { getMyAssignedRecords } = await import("./myAssignedRecords.server")

    await getMyAssignedRecords(headers, { direction: "all" })

    expect(listWhere().project).toEqual({ memberships: { some: { userId: 99 } } })
  })

  test("leaves an admin every project", async () => {
    mockSession.mockResolvedValue({ userId: 99, role: UserRoleEnum.ADMIN })
    const { getMyAssignedRecords } = await import("./myAssignedRecords.server")

    await getMyAssignedRecords(headers, { direction: "all" })

    expect(listWhere().project).toEqual({})
  })

  test("keeps the membership check when narrowing to one project", async () => {
    const { getMyAssignedRecords } = await import("./myAssignedRecords.server")

    await getMyAssignedRecords(headers, { direction: "all", projectSlug: "rs23" })

    expect(listWhere().project).toEqual({
      slug: "rs23",
      memberships: { some: { userId: 99 } },
    })
  })

  test("reads both sides of an assignment by default", async () => {
    const { getMyAssignedRecords } = await import("./myAssignedRecords.server")

    await getMyAssignedRecords(headers, { direction: "all" })

    expect(listWhere().OR).toEqual([{ assignedToId: 99 }, { assignedById: 99 }])
  })

  test("narrows to one side on request", async () => {
    const { getMyAssignedRecords } = await import("./myAssignedRecords.server")

    await getMyAssignedRecords(headers, { direction: "byMe" })

    expect(listWhere().assignedById).toBe(99)
    expect(listWhere()).not.toHaveProperty("OR")
  })
})

describe("countMyAssignedRecords", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession.mockResolvedValue({ userId: 99, role: UserRoleEnum.USER })
    mockDb.projectRecord.count.mockResolvedValue(0)
  })

  test("counts only what the user may still open, so the tab matches the list", async () => {
    const { countMyAssignedRecords } = await import("./myAssignedRecords.server")

    await countMyAssignedRecords(headers)

    expect(countWhere().project).toEqual({ memberships: { some: { userId: 99 } } })
    expect(countWhere().OR).toEqual([{ assignedToId: 99 }, { assignedById: 99 }])
  })

  test("can narrow the count to one project without dropping the membership check", async () => {
    const { countMyAssignedRecords } = await import("./myAssignedRecords.server")

    await countMyAssignedRecords(headers, "rs23")

    expect(countWhere().project).toEqual({
      slug: "rs23",
      memberships: { some: { userId: 99 } },
    })
  })
})
