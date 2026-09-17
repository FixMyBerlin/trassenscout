import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest"
import { GeometryTypeEnum } from "@/src/prisma/generated/browser"

const mockDb = {
  project: { findUnique: vi.fn() },
  subsection: { findFirst: vi.fn() },
  subsubsection: { findFirst: vi.fn(), create: vi.fn() },
  qualityLevel: { findFirst: vi.fn() },
  subsubsectionStatus: { findFirst: vi.fn() },
  subsubsectionTask: { findFirst: vi.fn() },
  subsubsectionInfra: { findFirst: vi.fn() },
  subsubsectionInfrastructureType: { findFirst: vi.fn() },
  mcpDraft: { upsert: vi.fn(), findUnique: vi.fn() },
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

const identity = {
  projectSlug: "frm9-ra3",
  subsectionSlug: "pa8",
  slug: "dre34",
}

const lineGeometry = {
  type: "LineString" as const,
  coordinates: [
    [9.1943, 48.8932],
    [9.2043, 48.8933],
  ],
}

function item(patch: Record<string, unknown>, slug = "dre34") {
  return { ...identity, slug, patch }
}

describe("Subsubsection MCP create", () => {
  let createSubsubsectionForMcp: (typeof import("@/src/server/mcp/queries/createSubsubsectionForMcp.server"))["createSubsubsectionForMcp"]

  beforeAll(async () => {
    ;({ createSubsubsectionForMcp } =
      await import("@/src/server/mcp/queries/createSubsubsectionForMcp.server"))
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb.project.findUnique.mockResolvedValue(enabledProject)
    mockDb.subsection.findFirst.mockResolvedValue({ id: 7, slug: "pa8" })
    mockDb.subsubsection.findFirst.mockResolvedValue(null)
    mockDb.mcpDraft.findUnique.mockResolvedValue(null)
    mockDb.mcpDraft.upsert.mockResolvedValue({ id: 1 })
  })

  test("drafts create without writing Subsubsection", async () => {
    const result = await createSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [
        item({
          type: GeometryTypeEnum.LINE,
          geometry: lineGeometry,
          description: "Neue Führung",
        }),
      ],
    })

    expect(result.items[0]?.drafted).toBe(true)
    expect(result.items[0]?.missingRequired).toEqual([])
    expect(result.items[0]?.url).toContain("/fuehrung/new")
    expect(result.items[0]?.url).toContain("mcpDraft=true")
    expect(result.items[0]?.changes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "type", kind: "set", proposed: "LINE" }),
        expect.objectContaining({
          field: "geometry",
          kind: "set",
          proposed: expect.objectContaining({ type: "LineString", vertexCount: 2 }),
        }),
        expect.objectContaining({ field: "description", kind: "set" }),
      ]),
    )
    expect(
      result.items[0]?.changes.find((change) => change.field === "geometry")?.proposed,
    ).not.toHaveProperty("coordinates")
    expect(mockDb.mcpDraft.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { parentSubsectionId_slug: { parentSubsectionId: 7, slug: "dre34" } },
        create: expect.objectContaining({
          parentSubsectionId: 7,
          slug: "dre34",
          patch: expect.objectContaining({
            type: "LINE",
            geometry: lineGeometry,
          }),
        }),
      }),
    )
    expect(mockDb.subsubsection.create).not.toHaveBeenCalled()
  })

  test("missing type and geometry are not drafted", async () => {
    const result = await createSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({ description: "ohne Geo" })],
    })

    expect(result.items[0]?.drafted).toBe(false)
    expect(result.items[0]?.missingRequired).toEqual(["type", "geometry"])
    expect(mockDb.mcpDraft.upsert).not.toHaveBeenCalled()
  })

  test("type/geometry mismatch is an error", async () => {
    const result = await createSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [
        item({
          type: GeometryTypeEnum.POINT,
          geometry: lineGeometry,
        }),
      ],
    })

    expect(result.items[0]?.drafted).toBe(false)
    expect(result.items[0]?.errors[0]).toContain("passen nicht zusammen")
  })

  test("existing measure is a slug conflict without draft", async () => {
    mockDb.subsubsection.findFirst.mockResolvedValue({ slug: "dre34" })

    const result = await createSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({ type: GeometryTypeEnum.LINE, geometry: lineGeometry })],
    })

    expect(result.items[0]?.drafted).toBe(false)
    expect(result.items[0]?.slugConflict).toEqual(expect.objectContaining({ kind: "measure" }))
    expect(result.items[0]?.errors[0]).toContain("subsubsections_update")
    expect(mockDb.mcpDraft.upsert).not.toHaveBeenCalled()
  })

  test("existing create draft is last-wins with warning", async () => {
    mockDb.mcpDraft.findUnique.mockResolvedValue({ id: 9 })

    const result = await createSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({ type: GeometryTypeEnum.LINE, geometry: lineGeometry })],
    })

    expect(result.items[0]?.drafted).toBe(true)
    expect(result.items[0]?.slugConflict).toEqual(expect.objectContaining({ kind: "createDraft" }))
    expect(result.items[0]?.warnings[0]).toContain("überschrieben")
    expect(mockDb.mcpDraft.upsert).toHaveBeenCalled()
  })

  test("geometry over 5000 vertices is rejected", async () => {
    const coordinates = Array.from({ length: 5001 }, (_, index) => [9 + index / 10000, 48])

    const result = await createSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [
        item({
          type: GeometryTypeEnum.LINE,
          geometry: { type: "LineString", coordinates },
        }),
      ],
    })

    expect(result.items[0]?.drafted).toBe(false)
    expect(result.items[0]?.errors[0]).toContain("5000")
    expect(mockDb.mcpDraft.upsert).not.toHaveBeenCalled()
  })
})
