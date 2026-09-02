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
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  qualityLevel: { findMany: vi.fn(), findFirst: vi.fn() },
  subsubsectionStatus: { findMany: vi.fn(), findFirst: vi.fn() },
  subsubsectionTask: { findMany: vi.fn(), findFirst: vi.fn() },
  subsubsectionInfra: { findMany: vi.fn(), findFirst: vi.fn() },
  subsubsectionInfrastructureType: { findMany: vi.fn(), findFirst: vi.fn() },
  user: { findMany: vi.fn() },
}

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

const enabledProject = {
  id: 1,
  slug: "frm9-ra3",
  mcpEnabled: true,
  subsubsectionExtraFieldDefinitions: [
    { name: "klassifizierung", label: "Klassifizierung", order: 0 },
  ],
}

describe("MCP read queries", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("projects_list returns mcpEnabled and includes disabled projects", async () => {
    const { listProjectsForMcp } =
      await import("@/src/server/mcp/queries/listProjectsForMcp.server")

    mockDb.project.findMany.mockResolvedValue([
      { id: 1, slug: "rs23", subTitle: "Test", mcpEnabled: false, _count: { subsections: 2 } },
      { id: 2, slug: "zz-on", subTitle: "On", mcpEnabled: true, _count: { subsections: 0 } },
    ])
    mockDb.subsection.findMany.mockResolvedValue([
      { projectId: 1, _count: { subsubsections: 3 } },
      { projectId: 1, _count: { subsubsections: 1 } },
    ])

    const result = await listProjectsForMcp("http://127.0.0.1:4000")

    expect(result.projects).toEqual([
      {
        slug: "rs23",
        subTitle: "Test",
        shortTitle: "RS23",
        url: "http://127.0.0.1:4000/rs23",
        mcpEnabled: false,
        paCount: 2,
        fuehrungCount: 4,
      },
      {
        slug: "zz-on",
        subTitle: "On",
        shortTitle: "ZZ-ON",
        url: "http://127.0.0.1:4000/zz-on",
        mcpEnabled: true,
        paCount: 0,
        fuehrungCount: 0,
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
      { id: 1, slug: "a", subTitle: "A", mcpEnabled: false, _count: { subsections: 0 } },
      { id: 2, slug: "b", subTitle: "B", mcpEnabled: false, _count: { subsections: 0 } },
      { id: 3, slug: "c", subTitle: "C", mcpEnabled: false, _count: { subsections: 0 } },
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

    mockDb.project.findUnique.mockResolvedValue(enabledProject)
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
  })

  test("fuehrungen_list does not load führungen when MCP is disabled", async () => {
    const { listFuehrungenForMcp } =
      await import("@/src/server/mcp/queries/listFuehrungenForMcp.server")

    mockDb.project.findUnique.mockResolvedValue({ ...enabledProject, mcpEnabled: false })

    await expect(
      listFuehrungenForMcp({
        projectSlug: "frm9-ra3",
        origin: "http://127.0.0.1:4000",
      }),
    ).rejects.toThrow('MCP is not enabled for project "frm9-ra3"')
    expect(mockDb.subsubsection.findMany).not.toHaveBeenCalled()
  })

  test("requireMcpEnabledProject distinguishes missing and disabled", async () => {
    const { requireMcpEnabledProject } =
      await import("@/src/server/mcp/requireMcpEnabledProject.server")

    mockDb.project.findUnique.mockResolvedValue(null)
    await expect(requireMcpEnabledProject("missing")).rejects.toThrow("Project not found: missing")

    mockDb.project.findUnique.mockResolvedValue({ ...enabledProject, mcpEnabled: false })
    await expect(requireMcpEnabledProject("frm9-ra3")).rejects.toThrow(
      'MCP is not enabled for project "frm9-ra3"',
    )
  })

  test("fuehrungen_schema marks geometry not writable and includes extra fields and enums", async () => {
    const { getFuehrungenSchemaForMcp } =
      await import("@/src/server/mcp/queries/getFuehrungenSchemaForMcp.server")

    mockDb.project.findUnique.mockResolvedValue(enabledProject)
    mockDb.qualityLevel.findMany.mockResolvedValue([{ id: 1, slug: "ql", title: "QL" }])
    mockDb.subsubsectionStatus.findMany.mockResolvedValue([])
    mockDb.subsubsectionTask.findMany.mockResolvedValue([])
    mockDb.subsubsectionInfra.findMany.mockResolvedValue([])
    mockDb.subsubsectionInfrastructureType.findMany.mockResolvedValue([])

    const schema = await getFuehrungenSchemaForMcp("frm9-ra3")
    expect(schema.projectSlug).toBe("frm9-ra3")
    expect(schema.fields.find((field) => field.name === "geometry")?.writable).toBe(false)
    expect(schema.fields.find((field) => field.name === "slug")?.writable).toBe(false)
    expect(schema.fields.find((field) => field.name === "lengthM")?.writable).toBe(true)
    expect(schema.fields.find((field) => field.name === "extraFields")).toMatchObject({
      writable: true,
      type: "Record<string,string>",
    })
    expect(schema.extraFields).toEqual([
      { name: "klassifizierung", label: "Klassifizierung", order: 0 },
    ])
    expect(schema.qualityLevels).toEqual([{ id: 1, slug: "ql", title: "QL" }])
    expect(schema).not.toHaveProperty("managers")
    expect(schema).not.toHaveProperty("labelPos")
    expect(schema.location).toEqual(
      expect.arrayContaining([
        { slug: "URBAN", title: "innerorts" },
        { slug: "RURAL", title: "außerorts" },
      ]),
    )
  })

  test("fuehrungen_schema parses empty extra field definitions", async () => {
    const { getFuehrungenSchemaForMcp } =
      await import("@/src/server/mcp/queries/getFuehrungenSchemaForMcp.server")

    mockDb.project.findUnique.mockResolvedValue({
      ...enabledProject,
      subsubsectionExtraFieldDefinitions: [],
    })
    mockDb.qualityLevel.findMany.mockResolvedValue([])
    mockDb.subsubsectionStatus.findMany.mockResolvedValue([])
    mockDb.subsubsectionTask.findMany.mockResolvedValue([])
    mockDb.subsubsectionInfra.findMany.mockResolvedValue([])
    mockDb.subsubsectionInfrastructureType.findMany.mockResolvedValue([])

    await expect(getFuehrungenSchemaForMcp("frm9-ra3")).resolves.toMatchObject({
      projectSlug: "frm9-ra3",
      extraFields: [],
    })
  })

  test("fuehrungen_schema does not load lookups when MCP is disabled", async () => {
    const { getFuehrungenSchemaForMcp } =
      await import("@/src/server/mcp/queries/getFuehrungenSchemaForMcp.server")

    mockDb.project.findUnique.mockResolvedValue({ ...enabledProject, mcpEnabled: false })
    await expect(getFuehrungenSchemaForMcp("frm9-ra3")).rejects.toThrow("MCP is not enabled")
    expect(mockDb.qualityLevel.findMany).not.toHaveBeenCalled()
    expect(mockDb.subsubsection.findFirst).not.toHaveBeenCalled()
  })
})
