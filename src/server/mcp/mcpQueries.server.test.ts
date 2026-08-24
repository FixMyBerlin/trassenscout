import { beforeEach, describe, expect, test, vi } from "vitest"

const mockDb = {
  project: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
  },
  subsection: {
    findMany: vi.fn(),
  },
  subsubsection: {
    findMany: vi.fn(),
  },
}

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

describe("MCP read queries", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("projects_list returns slug counts without heavy fields", async () => {
    const { listProjectsForMcp } =
      await import("@/src/server/mcp/queries/listProjectsForMcp.server")

    mockDb.project.findMany.mockResolvedValue([
      { id: 1, slug: "rs23", subTitle: "Test", _count: { subsections: 2 } },
    ])
    mockDb.subsection.findMany.mockResolvedValue([
      { projectId: 1, _count: { subsubsections: 3 } },
      { projectId: 1, _count: { subsubsections: 1 } },
    ])

    const result = await listProjectsForMcp("http://127.0.0.1:4000")

    expect(result.limit).toBe(20)
    expect(result.returned).toBe(1)
    expect(result.truncated).toBe(false)
    expect(result.projects).toEqual([
      {
        slug: "rs23",
        subTitle: "Test",
        shortTitle: "RS23",
        url: "http://127.0.0.1:4000/rs23",
        paCount: 2,
        fuehrungCount: 4,
      },
    ])
    expect(JSON.stringify(result)).not.toContain("description")
    expect(JSON.stringify(result)).not.toContain("geometry")
    expect(mockDb.project.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 21 }))
  })

  test("projects_list signals truncation when more rows exist", async () => {
    const { listProjectsForMcp } =
      await import("@/src/server/mcp/queries/listProjectsForMcp.server")

    mockDb.project.findMany.mockResolvedValue([
      { id: 1, slug: "a", subTitle: "A", _count: { subsections: 0 } },
      { id: 2, slug: "b", subTitle: "B", _count: { subsections: 0 } },
      { id: 3, slug: "c", subTitle: "C", _count: { subsections: 0 } },
    ])
    mockDb.subsection.findMany.mockResolvedValue([])

    const result = await listProjectsForMcp("http://127.0.0.1:4000", 2)

    expect(result.limit).toBe(2)
    expect(result.returned).toBe(2)
    expect(result.truncated).toBe(true)
    expect(result.projects).toHaveLength(2)
  })

  test("fuehrungen_list returns slugs and urls only", async () => {
    const { listFuehrungenForMcp } =
      await import("@/src/server/mcp/queries/listFuehrungenForMcp.server")

    mockDb.project.findUnique.mockResolvedValue({ id: 1, slug: "frm9-ra3" })
    mockDb.subsubsection.findMany.mockResolvedValue([
      {
        slug: "dre34",
        subsection: { slug: "pa8" },
      },
    ])

    const result = await listFuehrungenForMcp({
      projectSlug: "frm9-ra3",
      subsectionSlug: "pa8",
      origin: "http://127.0.0.1:4000",
    })

    expect(result.limit).toBe(20)
    expect(result.returned).toBe(1)
    expect(result.truncated).toBe(false)
    expect(result.fuehrungen).toEqual([
      {
        projectSlug: "frm9-ra3",
        subsectionSlug: "pa8",
        slug: "dre34",
        url: "http://127.0.0.1:4000/frm9-ra3/abschnitte/pa8/fuehrung/dre34",
      },
    ])
    expect(JSON.stringify(result)).not.toContain("description")
    expect(JSON.stringify(result)).not.toContain("extraFields")
    expect(JSON.stringify(result)).not.toContain("geometry")
    expect(mockDb.subsubsection.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 21 }),
    )
  })
})
