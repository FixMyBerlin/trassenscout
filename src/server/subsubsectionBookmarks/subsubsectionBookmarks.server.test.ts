import { beforeEach, describe, expect, test, vi } from "vitest"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { AuthorizationError, NotFoundError } from "@/src/shared/auth/errors"

const mockDb = vi.hoisted(() => ({
  membership: { findMany: vi.fn() },
  projectRecord: { findMany: vi.fn() },
  subsubsection: { findMany: vi.fn(), findFirst: vi.fn() },
  subsubsectionBookmark: { findFirst: vi.fn(), createMany: vi.fn(), deleteMany: vi.fn() },
}))
const mockSession = vi.hoisted(() => vi.fn())
const mockProjectRole = vi.hoisted(() => vi.fn())

vi.mock("@/src/server/db.server", () => ({ default: mockDb }))
vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: { session: mockSession, projectRole: mockProjectRole },
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
const listWhere = () => mockDb.subsubsection.findMany.mock.calls[0]?.[0]

function row(id: number, project: { id: number; slug: string; role?: "VIEWER" | "EDITOR" }) {
  return {
    id,
    slug: `rf-${id}`,
    type: null,
    geometry: null,
    managerId: null,
    manager: null,
    updatedAt: new Date("2026-05-01T10:00:00Z"),
    createdById: 7,
    updatedById: 7,
    updatedBy: null as { id: number; firstName: string; lastName: string } | null,
    subsection: {
      id: 100 + id,
      slug: `pa-${id}`,
      project: {
        id: project.id,
        slug: project.slug,
        aiEnabled: false,
        memberships: project.role ? [{ role: project.role }] : [],
      },
    },
    _count: { uploads: id },
  }
}

describe("getMyBookmarkedSubsubsections", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession.mockResolvedValue({ userId: 99, role: UserRoleEnum.USER })
    mockDb.subsubsection.findMany.mockResolvedValue([])
    mockDb.membership.findMany.mockResolvedValue([])
    mockDb.projectRecord.findMany.mockResolvedValue([])
  })

  test("scopes to the own bookmarks in readable projects with bookmarks enabled, newest first", async () => {
    const { getMyBookmarkedSubsubsections } = await import("./subsubsectionBookmarks.server")

    await getMyBookmarkedSubsubsections(headers, {})

    expect(listWhere().where).toEqual({
      bookmarks: { some: { userId: 99 } },
      subsection: {
        project: { memberships: { some: { userId: 99 } }, bookmarksEnabled: true },
      },
    })
    expect(listWhere().orderBy).toEqual([{ updatedAt: "desc" }, { id: "desc" }])
    expect(listWhere()).not.toHaveProperty("take")
  })

  test("filters by project and applies the limit", async () => {
    const { getMyBookmarkedSubsubsections } = await import("./subsubsectionBookmarks.server")

    await getMyBookmarkedSubsubsections(headers, { projectSlug: "rs23", limit: 5 })

    expect(listWhere().where.subsection.project).toEqual({
      slug: "rs23",
      memberships: { some: { userId: 99 } },
      bookmarksEnabled: true,
    })
    expect(listWhere().take).toBe(5)
  })

  test("leaves an admin every project but still requires bookmarksEnabled", async () => {
    mockSession.mockResolvedValue({ userId: 99, role: UserRoleEnum.ADMIN })
    const { getMyBookmarkedSubsubsections } = await import("./subsubsectionBookmarks.server")

    await getMyBookmarkedSubsubsections(headers, {})

    expect(listWhere().where.subsection.project).toEqual({ bookmarksEnabled: true })
  })

  test("returns project slug and a plain subsection, with manager redaction per project", async () => {
    const formerManager = { id: 7, firstName: "Ex", lastName: "Member" }
    mockDb.subsubsection.findMany.mockResolvedValue([
      { ...row(1, { id: 5, slug: "rs23", role: "VIEWER" }), managerId: 7, manager: formerManager },
      { ...row(2, { id: 6, slug: "rs24", role: "VIEWER" }), managerId: 7, manager: formerManager },
    ])
    // User 7 is still a member of project 6 only; the session user is a member of both.
    mockDb.membership.findMany.mockResolvedValue([
      { projectId: 5, userId: 99 },
      { projectId: 6, userId: 99 },
      { projectId: 6, userId: 7 },
    ])
    mockDb.projectRecord.findMany.mockResolvedValue([
      { subsubsectionId: 1, subsubsections: [] },
      { subsubsectionId: null, subsubsections: [{ id: 2 }] },
    ])
    const { getMyBookmarkedSubsubsections } = await import("./subsubsectionBookmarks.server")

    const [first, second] = await getMyBookmarkedSubsubsections(headers, {})

    expect(first).toMatchObject({
      id: 1,
      project: { slug: "rs23" },
      subsection: { id: 101, slug: "pa-1" },
      uploadCount: 1,
      projectRecordCount: 1,
      manager: { firstName: "Ehemalige:r Mitarbeiter:in", lastName: "" },
      managerId: null,
    })
    expect(first?.subsection).toEqual({ id: 101, slug: "pa-1" })
    expect(second).toMatchObject({
      id: 2,
      project: { slug: "rs24" },
      uploadCount: 2,
      projectRecordCount: 1,
      manager: formerManager,
      managerId: 7,
    })
    expect(mockDb.membership.findMany).toHaveBeenCalledTimes(1)
    expect(mockDb.projectRecord.findMany).toHaveBeenCalledTimes(1)
  })

  test("names who last edited a Maßnahme for members, but sends no user ids", async () => {
    const editor = { id: 7, firstName: "Erika", lastName: "Muster" }
    mockDb.subsubsection.findMany.mockResolvedValue([
      { ...row(1, { id: 5, slug: "rs23", role: "VIEWER" }), updatedBy: editor },
      { ...row(2, { id: 6, slug: "rs24", role: "VIEWER" }), updatedBy: editor },
    ])
    // User 7 is still a member of project 6 only.
    mockDb.membership.findMany.mockResolvedValue([
      { projectId: 5, userId: 99 },
      { projectId: 6, userId: 99 },
      { projectId: 6, userId: 7 },
    ])
    const { getMyBookmarkedSubsubsections } = await import("./subsubsectionBookmarks.server")

    const [first, second] = await getMyBookmarkedSubsubsections(headers, {})

    expect(first?.updatedBy).toEqual({ firstName: "Ehemalige:r Mitarbeiter:in", lastName: "" })
    expect(second?.updatedBy).toEqual(editor)
    expect(first).not.toHaveProperty("createdById")
    expect(first).not.toHaveProperty("updatedById")
    expect(listWhere().include.updatedBy).toEqual({
      select: { id: true, firstName: true, lastName: true },
    })
  })

  test("uses the member's own role per project for the Protokoll visibility", async () => {
    const withAi = (r: ReturnType<typeof row>) => ({
      ...r,
      subsection: { ...r.subsection, project: { ...r.subsection.project, aiEnabled: true } },
    })
    mockDb.subsubsection.findMany.mockResolvedValue([
      withAi(row(1, { id: 5, slug: "rs23", role: "VIEWER" })),
      withAi(row(2, { id: 6, slug: "rs24", role: "EDITOR" })),
    ])
    const { getMyBookmarkedSubsubsections } = await import("./subsubsectionBookmarks.server")

    await getMyBookmarkedSubsubsections(headers, {})

    const scopes = mockDb.projectRecord.findMany.mock.calls[0]?.[0]?.where.OR
    expect(scopes).toHaveLength(2)
    expect(scopes[0]).toMatchObject({ projectId: 5, OR: [{ reviewState: "APPROVED" }] })
    expect(scopes[1]).toMatchObject({
      projectId: 6,
      OR: [{ reviewState: "APPROVED" }, { reviewState: "NEEDSREVIEW" }],
    })
  })

  test("does not query Protokolle without bookmarks", async () => {
    const { getMyBookmarkedSubsubsections } = await import("./subsubsectionBookmarks.server")

    expect(await getMyBookmarkedSubsubsections(headers, {})).toEqual([])
    expect(mockDb.projectRecord.findMany).not.toHaveBeenCalled()
  })
})

describe("subsubsection bookmark toggle", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockProjectRole.mockResolvedValue({
      projectId: 5,
      session: { userId: 99, role: UserRoleEnum.USER },
      membershipRole: "VIEWER",
    })
    mockDb.subsubsection.findFirst.mockResolvedValue({ id: 21 })
    mockDb.subsubsectionBookmark.createMany.mockResolvedValue({ count: 1 })
    mockDb.subsubsectionBookmark.deleteMany.mockResolvedValue({ count: 1 })
  })

  test("bookmarking creates a bookmark and skips an existing one", async () => {
    const { setSubsubsectionBookmark } = await import("./subsubsectionBookmarks.server")

    const result = await setSubsubsectionBookmark(headers, {
      projectSlug: "rs23",
      subsubsectionId: 21,
      bookmarked: true,
    })

    expect(result).toEqual({ bookmarked: true })
    expect(mockDb.subsubsectionBookmark.createMany).toHaveBeenCalledWith({
      data: [{ userId: 99, subsubsectionId: 21 }],
      skipDuplicates: true,
    })
    expect(mockDb.subsubsectionBookmark.deleteMany).not.toHaveBeenCalled()
  })

  test("is idempotent when called twice", async () => {
    mockDb.subsubsectionBookmark.createMany.mockResolvedValueOnce({ count: 1 })
    mockDb.subsubsectionBookmark.createMany.mockResolvedValueOnce({ count: 0 })
    const { setSubsubsectionBookmark } = await import("./subsubsectionBookmarks.server")
    const input = { projectSlug: "rs23", subsubsectionId: 21, bookmarked: true }

    await expect(setSubsubsectionBookmark(headers, input)).resolves.toEqual({ bookmarked: true })
    await expect(setSubsubsectionBookmark(headers, input)).resolves.toEqual({ bookmarked: true })
  })

  test("removing deletes only the own row", async () => {
    const { setSubsubsectionBookmark } = await import("./subsubsectionBookmarks.server")

    const result = await setSubsubsectionBookmark(headers, {
      projectSlug: "rs23",
      subsubsectionId: 21,
      bookmarked: false,
    })

    expect(result).toEqual({ bookmarked: false })
    expect(mockDb.subsubsectionBookmark.deleteMany).toHaveBeenCalledWith({
      where: { userId: 99, subsubsectionId: 21 },
    })
    expect(mockDb.subsubsectionBookmark.createMany).not.toHaveBeenCalled()
  })

  test("a Maßnahme of another project is not found", async () => {
    mockDb.subsubsection.findFirst.mockResolvedValue(null)
    const { setSubsubsectionBookmark } = await import("./subsubsectionBookmarks.server")

    await expect(
      setSubsubsectionBookmark(headers, {
        projectSlug: "rs23",
        subsubsectionId: 21,
        bookmarked: true,
      }),
    ).rejects.toBeInstanceOf(NotFoundError)

    expect(mockDb.subsubsection.findFirst).toHaveBeenCalledWith({
      where: { id: 21, subsection: { project: { slug: "rs23" } } },
      select: { id: true },
    })
    expect(mockDb.subsubsectionBookmark.createMany).not.toHaveBeenCalled()
  })

  test("lets viewers bookmark and rejects non-members", async () => {
    const { setSubsubsectionBookmark } = await import("./subsubsectionBookmarks.server")

    await setSubsubsectionBookmark(headers, {
      projectSlug: "rs23",
      subsubsectionId: 21,
      bookmarked: true,
    })
    expect(mockProjectRole).toHaveBeenCalledWith(headers, "rs23", ["VIEWER", "EDITOR"])

    mockProjectRole.mockRejectedValue(new AuthorizationError())
    await expect(
      setSubsubsectionBookmark(headers, {
        projectSlug: "rs23",
        subsubsectionId: 21,
        bookmarked: true,
      }),
    ).rejects.toBeInstanceOf(AuthorizationError)
  })

  test("reads the own bookmark state within the project", async () => {
    mockDb.subsubsectionBookmark.findFirst.mockResolvedValueOnce({ id: 1 })
    mockDb.subsubsectionBookmark.findFirst.mockResolvedValueOnce(null)
    const { getSubsubsectionBookmark } = await import("./subsubsectionBookmarks.server")
    const input = { projectSlug: "rs23", subsubsectionId: 21 }

    await expect(getSubsubsectionBookmark(headers, input)).resolves.toEqual({ bookmarked: true })
    await expect(getSubsubsectionBookmark(headers, input)).resolves.toEqual({ bookmarked: false })
    expect(mockDb.subsubsectionBookmark.findFirst).toHaveBeenCalledWith({
      where: {
        userId: 99,
        subsubsection: { id: 21, subsection: { project: { slug: "rs23" } } },
      },
      select: { id: true },
    })
  })
})
