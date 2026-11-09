import { beforeEach, describe, expect, test, vi } from "vitest"
import { viewerRoles } from "@/src/server/authorization/constants"
import { getAssigneeRanking } from "./assigneeRanking.server"

const mocks = vi.hoisted(() => ({
  projectRole: vi.fn(),
  findSubsections: vi.fn(),
  groupRecords: vi.fn(),
  findMemberships: vi.fn(),
}))

vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: { projectRole: (...args: unknown[]) => mocks.projectRole(...args) },
}))

vi.mock("@/src/server/db.server", () => ({
  default: {
    subsection: { findMany: (...args: unknown[]) => mocks.findSubsections(...args) },
    projectRecord: { groupBy: (...args: unknown[]) => mocks.groupRecords(...args) },
    membership: { findMany: (...args: unknown[]) => mocks.findMemberships(...args) },
  },
}))

const headers = new Headers()
const input = { projectSlug: "ohv", subsubsectionIds: [1, 2], acquisitionAreaIds: [3] }
const recordWhere = () => mocks.groupRecords.mock.calls[0]?.[0]?.where

beforeEach(() => {
  vi.clearAllMocks()
  mocks.projectRole.mockResolvedValue({ projectId: 7, session: { userId: "99", role: "USER" } })
  mocks.findSubsections.mockResolvedValue([])
  mocks.groupRecords.mockResolvedValue([])
  mocks.findMemberships.mockResolvedValue([11, 31, 32].map((userId) => ({ projectId: 7, userId })))
})

describe("getAssigneeRanking", () => {
  test("lets read-only members ask, they can reassign a record inline too", async () => {
    await getAssigneeRanking(headers, input)

    expect(mocks.projectRole).toHaveBeenCalledWith(headers, "ohv", viewerRoles)
  })

  test("finds the PAs through Maßnahmen and Verhandlungsflächen, in this project only", async () => {
    await getAssigneeRanking(headers, input)

    expect(mocks.findSubsections.mock.calls[0]?.[0]?.where).toEqual({
      projectId: 7,
      subsubsections: {
        some: {
          OR: [{ id: { in: [1, 2] } }, { acquisitionAreas: { some: { id: { in: [3] } } } }],
        },
      },
    })
  })

  test("counts open and completed tasks, the same set as the Aufgaben pages", async () => {
    await getAssigneeRanking(headers, input)

    expect(recordWhere()).toMatchObject({
      projectId: 7,
      assignedToId: { not: null },
      reviewState: "APPROVED",
      NOT: { projectRecordAuthorType: "SYSTEM", project: { aiEnabled: false } },
    })
    expect(recordWhere()).not.toHaveProperty("editingState")
  })

  test("counts across the whole project when the record reaches no PA", async () => {
    mocks.groupRecords.mockResolvedValue([{ assignedToId: 11, _count: { _all: 4 } }])

    await expect(getAssigneeRanking(headers, input)).resolves.toEqual({
      leadIds: [],
      assignmentCounts: { "11": 4 },
    })
    expect(recordWhere()).not.toHaveProperty("OR")
  })

  test("only counts tasks that reach the PAs, through any kind of link", async () => {
    mocks.findSubsections.mockResolvedValue([
      { id: 21, managerId: null },
      { id: 22, managerId: null },
    ])

    await getAssigneeRanking(headers, input)

    const inSubsections = { subsectionId: { in: [21, 22] } }
    expect(recordWhere().OR).toEqual([
      { subsubsection: inSubsections },
      { subsubsections: { some: inSubsections } },
      { acquisitionArea: { subsubsection: inSubsections } },
      { acquisitionAreas: { some: { subsubsection: inSubsections } } },
    ])
  })

  test("returns the leads of the linked PAs and skips a PA without one", async () => {
    mocks.findSubsections.mockResolvedValue([
      { id: 21, managerId: 31 },
      { id: 22, managerId: null },
      { id: 23, managerId: 32 },
    ])

    const { leadIds } = await getAssigneeRanking(headers, input)

    expect(leadIds).toEqual([31, 32])
  })

  test("leaves out the ids of people who are no longer project members", async () => {
    mocks.findSubsections.mockResolvedValue([
      { id: 21, managerId: 31 },
      { id: 22, managerId: 40 },
    ])
    mocks.groupRecords.mockResolvedValue([
      { assignedToId: 11, _count: { _all: 4 } },
      { assignedToId: 41, _count: { _all: 2 } },
    ])

    await expect(getAssigneeRanking(headers, input)).resolves.toEqual({
      leadIds: [31],
      assignmentCounts: { "11": 4 },
    })
  })
})
