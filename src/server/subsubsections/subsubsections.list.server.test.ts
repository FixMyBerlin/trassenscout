import { beforeEach, describe, expect, test, vi } from "vitest"
import { ProjectRecordReviewState } from "@/src/prisma/generated/browser"

const mockDb = vi.hoisted(() => ({
  membership: { findMany: vi.fn() },
  project: { findUnique: vi.fn() },
  projectRecord: { findMany: vi.fn() },
  subsubsection: { findMany: vi.fn() },
}))
const mockProjectRole = vi.hoisted(() => vi.fn())

vi.mock("@/src/server/db.server", () => ({ default: mockDb }))
vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: { projectRole: mockProjectRole },
}))
vi.mock("@/src/server/logEntries/create/createLogEntry", () => ({
  createLogEntry: vi.fn(),
}))
vi.mock("@/src/server/mcp/mcpDrafts/mcpDrafts.server", () => ({
  deleteSubsubsectionMcpCreateDraftBySlug: vi.fn(),
}))
vi.mock("@/src/server/subsubsectionBookmarks/recordSubsubsectionActivity.server", () => ({
  recordSubsubsectionActivity: vi.fn(),
  addSubsubsectionBookmarks: vi.fn(),
}))

const headers = new Headers()

function row(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    slug: "rf-1",
    type: null,
    geometry: null,
    managerId: 2,
    manager: { id: 2, firstName: "Mara", lastName: "Manager" },
    updatedAt: new Date("2026-05-01T10:00:00Z"),
    createdById: 2,
    updatedById: 2,
    subsection: { id: 10, slug: "pa-1" },
    _count: { uploads: 3 },
    ...overrides,
  }
}

const recordWhere = () => mockDb.projectRecord.findMany.mock.calls[0]?.[0]?.where
const needsReviewVisible = { reviewState: ProjectRecordReviewState.NEEDSREVIEW }
const scopeWhere = () => recordWhere().OR[0]

describe("getSubsubsections list rows", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockProjectRole.mockResolvedValue({
      projectId: 5,
      session: { userId: 1, role: "USER" },
      membershipRole: "VIEWER",
    })
    mockDb.membership.findMany.mockResolvedValue([
      { projectId: 5, userId: 1 },
      { projectId: 5, userId: 2 },
    ])
    mockDb.project.findUnique.mockResolvedValue({ aiEnabled: false })
    mockDb.projectRecord.findMany.mockResolvedValue([])
  })

  test("adds activity, upload count and Protokoll count, and drops _count", async () => {
    mockDb.subsubsection.findMany.mockResolvedValue([row()])
    mockDb.projectRecord.findMany.mockResolvedValue([
      { subsubsectionId: 1, subsubsections: [] },
      { subsubsectionId: null, subsubsections: [{ id: 1 }] },
    ])
    const { getSubsubsections } = await import("./subsubsections.server")

    const [first] = await getSubsubsections(headers, { projectSlug: "p" })

    expect(first).toMatchObject({
      id: 1,
      updatedAt: new Date("2026-05-01T10:00:00Z"),
      uploadCount: 3,
      projectRecordCount: 2,
    })
    expect(first).not.toHaveProperty("_count")
  })

  test("does not send who created or last edited a Maßnahme, also for former members", async () => {
    mockDb.membership.findMany.mockResolvedValue([{ projectId: 5, userId: 1 }])
    mockDb.subsubsection.findMany.mockResolvedValue([row()])
    const { getSubsubsections } = await import("./subsubsections.server")

    const [first] = await getSubsubsections(headers, { projectSlug: "p" })

    expect(first).not.toHaveProperty("createdById")
    expect(first).not.toHaveProperty("updatedById")
    expect(first).not.toHaveProperty("updatedBy")
  })

  test("still redacts the manager of a former member", async () => {
    mockDb.membership.findMany.mockResolvedValue([{ projectId: 5, userId: 1 }])
    mockDb.subsubsection.findMany.mockResolvedValue([row()])
    const { getSubsubsections } = await import("./subsubsections.server")

    const [first] = await getSubsubsections(headers, { projectSlug: "p" })

    expect(first?.manager).toEqual({ firstName: "Ehemalige:r Mitarbeiter:in", lastName: "" })
    expect(first?.managerId).toBeNull()
  })

  test("counts a record linked directly and via m2n once and each linked Maßnahme once", async () => {
    mockDb.subsubsection.findMany.mockResolvedValue([
      row({ id: 1 }),
      row({ id: 2 }),
      row({ id: 3 }),
    ])
    mockDb.projectRecord.findMany.mockResolvedValue([
      { subsubsectionId: 1, subsubsections: [{ id: 1 }, { id: 2 }] },
      { subsubsectionId: 2, subsubsections: [] },
      // Direct link to a Maßnahme that is not on this page does not count for anyone.
      { subsubsectionId: 99, subsubsections: [{ id: 3 }] },
    ])
    const { getSubsubsections } = await import("./subsubsections.server")

    const rows = await getSubsubsections(headers, { projectSlug: "p" })

    expect(rows.map((r) => r.projectRecordCount)).toEqual([1, 2, 1])
  })

  test("asks for Protokolle of all Maßnahmen in one query with the Protokoll list visibility", async () => {
    mockDb.subsubsection.findMany.mockResolvedValue([row({ id: 1 }), row({ id: 2 })])
    const { getSubsubsections } = await import("./subsubsections.server")

    await getSubsubsections(headers, { projectSlug: "p" })

    expect(mockDb.projectRecord.findMany).toHaveBeenCalledTimes(1)
    const where = recordWhere()
    expect(scopeWhere()).toMatchObject({
      projectId: 5,
      OR: [
        {
          reviewState: ProjectRecordReviewState.APPROVED,
          projectRecordAuthorType: { not: "SYSTEM" },
        },
      ],
    })
    expect(where.AND).toEqual([
      {
        OR: [
          { subsubsectionId: { in: [1, 2] } },
          { subsubsections: { some: { id: { in: [1, 2] } } } },
        ],
      },
    ])
  })

  test("lets editors count Protokolle that need review (AI enabled), viewers not", async () => {
    mockDb.subsubsection.findMany.mockResolvedValue([row()])
    mockDb.project.findUnique.mockResolvedValue({ aiEnabled: true })
    const { getSubsubsections } = await import("./subsubsections.server")

    await getSubsubsections(headers, { projectSlug: "p" })
    expect(scopeWhere().OR).not.toContainEqual(needsReviewVisible)

    mockDb.projectRecord.findMany.mockClear()
    mockProjectRole.mockResolvedValue({
      projectId: 5,
      session: { userId: 1, role: "USER" },
      membershipRole: "EDITOR",
    })
    await getSubsubsections(headers, { projectSlug: "p" })
    expect(scopeWhere().OR).toContainEqual(needsReviewVisible)
  })

  test("skips the Protokoll query without Maßnahmen", async () => {
    mockDb.subsubsection.findMany.mockResolvedValue([])
    const { getSubsubsections } = await import("./subsubsections.server")

    expect(await getSubsubsections(headers, { projectSlug: "p" })).toEqual([])
    expect(mockDb.projectRecord.findMany).not.toHaveBeenCalled()
  })
})
