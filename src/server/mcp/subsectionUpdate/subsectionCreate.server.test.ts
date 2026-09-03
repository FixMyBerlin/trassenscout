import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest"
import { GeometryTypeEnum } from "@/src/prisma/generated/browser"

const mockDb = {
  project: { findUnique: vi.fn() },
  subsection: { findFirst: vi.fn(), create: vi.fn() },
  operator: { findFirst: vi.fn() },
  networkHierarchy: { findFirst: vi.fn() },
  subsectionStatus: { findFirst: vi.fn() },
  mcpDraft: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), upsert: vi.fn() },
}

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

const enabledProject = {
  id: 1,
  slug: "frm9-ra3",
  mcpEnabled: true,
}

const identity = {
  projectSlug: "frm9-ra3",
  slug: "pa8",
}

const lineGeometry = {
  type: "LineString" as const,
  coordinates: [
    [9.1943, 48.8932],
    [9.2043, 48.8933],
  ],
}

function item(patch: Record<string, unknown>, slug = "pa8") {
  return { ...identity, slug, patch }
}

describe("Subsection MCP create", () => {
  let createSubsectionForMcp: (typeof import("@/src/server/mcp/queries/createSubsectionForMcp.server"))["createSubsectionForMcp"]

  beforeAll(async () => {
    ;({ createSubsectionForMcp } =
      await import("@/src/server/mcp/queries/createSubsectionForMcp.server"))
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb.project.findUnique.mockResolvedValue(enabledProject)
    mockDb.subsection.findFirst.mockResolvedValue(null)
    mockDb.mcpDraft.findFirst.mockResolvedValue(null)
    mockDb.mcpDraft.create.mockResolvedValue({ id: 1 })
  })

  test("drafts create without writing Subsection", async () => {
    const result = await createSubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [
        item({
          type: GeometryTypeEnum.LINE,
          geometry: lineGeometry,
          description: "Neuer PA",
        }),
      ],
    })

    expect(result.items[0]?.drafted).toBe(true)
    expect(result.items[0]?.missingRequired).toEqual([])
    expect(result.items[0]?.url).toContain("/abschnitte/new")
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
    expect(mockDb.mcpDraft.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: "pa8",
          patch: expect.objectContaining({
            type: "LINE",
            geometry: lineGeometry,
          }),
        }),
      }),
    )
    expect(mockDb.subsection.create).not.toHaveBeenCalled()
  })

  test("missing type and geometry are not drafted", async () => {
    const result = await createSubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({ description: "ohne Geo" })],
    })

    expect(result.items[0]?.drafted).toBe(false)
    expect(result.items[0]?.missingRequired).toEqual(["type", "geometry"])
    expect(mockDb.mcpDraft.create).not.toHaveBeenCalled()
  })

  test("POINT is rejected", async () => {
    const result = await createSubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [
        item({
          type: GeometryTypeEnum.POINT,
          geometry: { type: "Point", coordinates: [9.19, 48.89] },
        }),
      ],
    })

    expect(result.items[0]?.drafted).toBe(false)
    expect(result.items[0]?.errors[0]).toContain("POINT")
    expect(mockDb.mcpDraft.create).not.toHaveBeenCalled()
  })

  test("existing PA is a slug conflict without draft", async () => {
    mockDb.subsection.findFirst.mockResolvedValue({ slug: "pa8" })

    const result = await createSubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({ type: GeometryTypeEnum.LINE, geometry: lineGeometry })],
    })

    expect(result.items[0]?.drafted).toBe(false)
    expect(result.items[0]?.slugConflict).toEqual(expect.objectContaining({ kind: "subsection" }))
    expect(result.items[0]?.errors[0]).toContain("subsections_update")
    expect(mockDb.mcpDraft.create).not.toHaveBeenCalled()
  })

  test("existing create draft is last-wins with warning", async () => {
    const { Prisma } = await import("@/src/prisma/generated/client")
    mockDb.mcpDraft.findFirst.mockResolvedValue({ id: 9 })
    mockDb.mcpDraft.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint", {
        code: "P2002",
        clientVersion: "test",
      }),
    )
    mockDb.mcpDraft.update.mockResolvedValue({ id: 9 })

    const result = await createSubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({ type: GeometryTypeEnum.LINE, geometry: lineGeometry })],
    })

    expect(result.items[0]?.drafted).toBe(true)
    expect(result.items[0]?.slugConflict).toEqual(expect.objectContaining({ kind: "createDraft" }))
    expect(result.items[0]?.warnings[0]).toContain("überschrieben")
    expect(mockDb.mcpDraft.update).toHaveBeenCalled()
  })

  test("geometry over 5000 vertices is rejected", async () => {
    const coordinates = Array.from({ length: 5001 }, (_, index) => [9 + index / 10000, 48])

    const result = await createSubsectionForMcp({
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
    expect(mockDb.mcpDraft.create).not.toHaveBeenCalled()
  })
})
