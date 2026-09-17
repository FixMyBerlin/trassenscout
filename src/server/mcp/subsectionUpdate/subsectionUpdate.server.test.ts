import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest"

const mockDb = {
  project: { findUnique: vi.fn() },
  subsection: { findFirst: vi.fn(), update: vi.fn() },
  operator: { findFirst: vi.fn() },
  networkHierarchy: { findFirst: vi.fn() },
  subsectionStatus: { findFirst: vi.fn() },
  mcpDraft: { upsert: vi.fn() },
}

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

const enabledProject = {
  id: 1,
  slug: "frm9-ra3",
  mcpEnabled: true,
}

function mockSubsection(overrides: Record<string, unknown> = {}) {
  return {
    id: 10,
    slug: "pa8",
    description: null,
    lengthM: 120,
    estimatedCompletionDateString: null,
    operator: null,
    networkHierarchy: null,
    SubsectionStatus: null,
    ...overrides,
  }
}

const identity = {
  projectSlug: "frm9-ra3",
  slug: "pa8",
}

function item(patch: Record<string, unknown>, slug = "pa8") {
  return { ...identity, slug, patch }
}

describe("Subsection MCP patch", () => {
  let updateSubsectionForMcp: (typeof import("@/src/server/mcp/queries/updateSubsectionForMcp.server"))["updateSubsectionForMcp"]
  let subsectionMcpPatchSchema: (typeof import("@/src/server/mcp/subsectionUpdate/patchSchema"))["subsectionMcpPatchSchema"]

  beforeAll(async () => {
    ;({ updateSubsectionForMcp } =
      await import("@/src/server/mcp/queries/updateSubsectionForMcp.server"))
    ;({ subsectionMcpPatchSchema } = await import("@/src/server/mcp/subsectionUpdate/patchSchema"))
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb.project.findUnique.mockResolvedValue(enabledProject)
    mockDb.subsection.findFirst.mockResolvedValue(mockSubsection())
    mockDb.mcpDraft.upsert.mockResolvedValue({ id: 1 })
  })

  test("draft response diffs set vs overwrite and warns only for overwrite", async () => {
    const result = await updateSubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({ lengthM: 185.4, description: "Neu" })],
    })

    expect(result.items[0]?.drafted).toBe(true)
    expect(result.items[0]?.changes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "lengthM", kind: "overwrite", proposed: 185.4 }),
        expect.objectContaining({ field: "description", kind: "set", proposed: "Neu" }),
      ]),
    )
    expect(result.items[0]?.warnings).toEqual(["Länge wird überschrieben."])
    expect(result.items[0]?.errors).toEqual([])
  })

  test("empty or unchanged patch is not drafted", async () => {
    const empty = await updateSubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({})],
    })
    expect(empty.items[0]?.drafted).toBe(false)
    expect(empty.items[0]?.changes).toEqual([])

    const unchanged = await updateSubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({ lengthM: 120 })],
    })
    expect(unchanged.items[0]?.drafted).toBe(false)
    expect(mockDb.mcpDraft.upsert).not.toHaveBeenCalled()
    expect(mockDb.subsection.update).not.toHaveBeenCalled()
  })

  test("null is rejected by the patch schema", async () => {
    expect(subsectionMcpPatchSchema.safeParse({ lengthM: null }).success).toBe(false)
    expect(subsectionMcpPatchSchema.safeParse({ description: "" }).success).toBe(false)
    expect(subsectionMcpPatchSchema.safeParse({ managerId: 1 }).success).toBe(false)
    expect(subsectionMcpPatchSchema.safeParse({ type: "LINE" }).success).toBe(false)
  })

  test("missing subsection is a per-item error", async () => {
    mockDb.subsection.findFirst.mockResolvedValue(null)
    const result = await updateSubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({ lengthM: 1 })],
    })
    expect(result.items[0]?.drafted).toBe(false)
    expect(result.items[0]?.errors[0]).toContain("Subsection (Planungsabschnitt) not found")
  })

  test("unknown relation slug returns an error instead of throwing", async () => {
    mockDb.operator.findFirst.mockResolvedValue(null)
    const result = await updateSubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({ operatorSlug: "missing" })],
    })
    expect(result.items[0]?.drafted).toBe(false)
    expect(result.items[0]?.errors[0]).toContain("Unknown operatorSlug")
  })

  test("disabled project does not load subsections", async () => {
    mockDb.project.findUnique.mockResolvedValue({ ...enabledProject, mcpEnabled: false })
    const result = await updateSubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({ lengthM: 1 })],
    })
    expect(result.items[0]?.errors[0]).toContain("MCP is not enabled")
    expect(mockDb.subsection.findFirst).not.toHaveBeenCalled()
  })

  test("update upserts drafts, does not write the PA, returns url and proposed", async () => {
    const written = await updateSubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({ lengthM: 185.4 })],
    })

    expect(written.draftedCount).toBe(1)
    expect(written.items[0]).toMatchObject({
      drafted: true,
      slug: "pa8",
      url: "http://127.0.0.1:4000/frm9-ra3/abschnitte/pa8",
    })
    expect(mockDb.mcpDraft.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { subsectionId: 10 },
        create: expect.objectContaining({
          createdById: 42,
          projectId: 1,
          subsectionId: 10,
          patch: expect.objectContaining({ lengthM: 185.4 }),
        }),
      }),
    )
    expect(mockDb.subsection.update).not.toHaveBeenCalled()
  })

  test("last duplicate identity in one call wins", async () => {
    await updateSubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({ lengthM: 1 }), item({ lengthM: 99 })],
    })

    expect(mockDb.mcpDraft.upsert).toHaveBeenCalledTimes(1)
    expect(mockDb.mcpDraft.upsert.mock.calls[0]?.[0].create.patch).toEqual({ lengthM: 99 })
  })
})
