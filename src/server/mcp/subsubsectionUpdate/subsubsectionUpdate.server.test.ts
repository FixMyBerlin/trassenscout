import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest"
import { LabelPositionEnum } from "@/src/prisma/generated/browser"

const mockDb = {
  project: { findUnique: vi.fn() },
  subsubsection: { findFirst: vi.fn(), update: vi.fn(), findMany: vi.fn() },
  qualityLevel: { findFirst: vi.fn() },
  subsubsectionStatus: { findFirst: vi.fn() },
  subsubsectionTask: { findFirst: vi.fn() },
  subsubsectionInfra: { findFirst: vi.fn() },
  subsubsectionInfrastructureType: { findFirst: vi.fn() },
  mcpDraft: { upsert: vi.fn(), deleteMany: vi.fn() },
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

function mockSubsubsection(overrides: Record<string, unknown> = {}) {
  return {
    id: 10,
    slug: "dre34",
    subTitle: null,
    type: "LINE",
    location: null,
    geometry: { type: "LineString", coordinates: [] },
    labelPos: LabelPositionEnum.bottom,
    lengthM: 120,
    width: null,
    widthExisting: null,
    description: null,
    mapillaryKey: null,
    isExistingInfra: false,
    maxSpeed: null,
    trafficLoad: null,
    trafficLoadDate: null,
    planningPeriod: null,
    constructionPeriod: null,
    estimatedCompletionDate: null,
    estimatedConstructionDateString: null,
    costEstimate: null,
    planningCosts: null,
    deliveryCosts: null,
    constructionCosts: null,
    landAcquisitionCosts: null,
    expensesOfficialOrders: null,
    expensesTechnicalVerification: null,
    nonEligibleExpenses: null,
    revenuesEconomicIncome: null,
    contributionsThirdParties: null,
    grantsOtherFunding: null,
    ownFunds: null,
    qualityLevelId: null,
    managerId: null,
    subsectionId: 1,
    subsubsectionStatusId: null,
    subsubsectionTaskId: null,
    subsubsectionInfraId: null,
    extraFields: {},
    specialFeatures: [],
    SubsubsectionInfrastructureTypes: [],
    qualityLevel: null,
    SubsubsectionStatus: null,
    SubsubsectionTask: null,
    SubsubsectionInfra: null,
    subsection: { slug: "pa8" },
    ...overrides,
  }
}

const identity = {
  projectSlug: "frm9-ra3",
  subsectionSlug: "pa8",
  slug: "dre34",
}

function item(patch: Record<string, unknown>, slug = "dre34") {
  return { ...identity, slug, patch }
}

describe("Subsubsection MCP patch", () => {
  let updateSubsubsectionForMcp: (typeof import("@/src/server/mcp/queries/updateSubsubsectionForMcp.server"))["updateSubsubsectionForMcp"]
  let subsubsectionMcpPatchSchema: (typeof import("@/src/server/mcp/subsubsectionUpdate/patchSchema"))["subsubsectionMcpPatchSchema"]

  beforeAll(async () => {
    ;({ updateSubsubsectionForMcp } =
      await import("@/src/server/mcp/queries/updateSubsubsectionForMcp.server"))
    ;({ subsubsectionMcpPatchSchema } =
      await import("@/src/server/mcp/subsubsectionUpdate/patchSchema"))
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb.project.findUnique.mockResolvedValue(enabledProject)
    mockDb.subsubsection.findFirst.mockResolvedValue(mockSubsubsection())
    mockDb.mcpDraft.upsert.mockResolvedValue({ id: 1 })
  })

  test("draft response diffs set vs overwrite and warns only for overwrite", async () => {
    const result = await updateSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [
        item({
          lengthM: 185.4,
          extraFields: { klassifizierung: "Landesstraße" },
        }),
      ],
    })

    expect(result.items[0]?.drafted).toBe(true)
    expect(result.items[0]?.changes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "lengthM",
          kind: "overwrite",
          proposed: 185.4,
        }),
        expect.objectContaining({
          field: "extraFields.klassifizierung",
          kind: "set",
          proposed: "Landesstraße",
        }),
      ]),
    )
    expect(result.items[0]?.warnings).toEqual(["Länge wird überschrieben."])
    expect(result.items[0]?.errors).toEqual([])
  })

  test("unknown extra field key and empty string are errors", async () => {
    const unknown = await updateSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({ extraFields: { unknown: "x" } })],
    })
    expect(unknown.items[0]?.drafted).toBe(false)
    expect(unknown.items[0]?.errors[0]).toContain("Unknown extraFields key")

    const empty = await updateSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({ extraFields: { klassifizierung: "" } })],
    })
    expect(empty.items[0]?.drafted).toBe(false)
    expect(empty.items[0]?.errors[0]).toContain("empty string")
  })

  test("empty or unchanged patch is not drafted", async () => {
    const empty = await updateSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({})],
    })
    expect(empty.items[0]?.drafted).toBe(false)
    expect(empty.items[0]?.changes).toEqual([])

    const unchanged = await updateSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({ lengthM: 120 })],
    })
    expect(unchanged.items[0]?.drafted).toBe(false)
    expect(unchanged.items[0]?.changes).toEqual([])

    expect(mockDb.mcpDraft.upsert).not.toHaveBeenCalled()
    expect(mockDb.subsubsection.update).not.toHaveBeenCalled()
  })

  test("null is rejected by the patch schema", async () => {
    expect(subsubsectionMcpPatchSchema.safeParse({ lengthM: null }).success).toBe(false)
    expect(subsubsectionMcpPatchSchema.safeParse({ description: "" }).success).toBe(false)
    expect(subsubsectionMcpPatchSchema.safeParse({ managerId: 1 }).success).toBe(false)
    expect(subsubsectionMcpPatchSchema.safeParse({ labelPos: "bottom" }).success).toBe(false)
    expect(subsubsectionMcpPatchSchema.safeParse({ lengthM: Number.NaN }).success).toBe(false)
    expect(
      subsubsectionMcpPatchSchema.safeParse({ subsubsectionInfrastructureTypeSlugs: [] }).success,
    ).toBe(false)
    expect(
      subsubsectionMcpPatchSchema.safeParse({
        extraFields: { klassifizierung: "x".repeat(10_001) },
      }).success,
    ).toBe(false)
  })

  test("missing subsubsection is a per-item error", async () => {
    mockDb.subsubsection.findFirst.mockResolvedValue(null)
    const result = await updateSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({ lengthM: 1 })],
    })
    expect(result.items[0]?.drafted).toBe(false)
    expect(result.items[0]?.errors[0]).toContain("Subsubsection (Maßnahme) not found")
  })

  test("unknown relation slug returns an error instead of throwing", async () => {
    mockDb.qualityLevel.findFirst.mockResolvedValue(null)
    const result = await updateSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({ qualityLevelSlug: "missing" })],
    })
    expect(result.items[0]?.drafted).toBe(false)
    expect(result.items[0]?.errors[0]).toContain("Unknown qualityLevelSlug")
  })

  test("M2M slugs full-replace", async () => {
    mockDb.subsubsection.findFirst.mockResolvedValue(
      mockSubsubsection({
        SubsubsectionInfrastructureTypes: [{ id: 1, slug: "old" }],
      }),
    )
    mockDb.subsubsectionInfrastructureType.findFirst.mockResolvedValue({ id: 2 })

    const result = await updateSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({ subsubsectionInfrastructureTypeSlugs: ["new"] })],
    })
    expect(result.items[0]?.drafted).toBe(true)
    expect(result.items[0]?.changes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "subsubsectionInfrastructureTypeSlugs",
          kind: "overwrite",
          proposed: ["new"],
        }),
      ]),
    )
  })

  test("disabled project does not load subsubsections", async () => {
    mockDb.project.findUnique.mockResolvedValue({ ...enabledProject, mcpEnabled: false })
    const result = await updateSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({ lengthM: 1 })],
    })
    expect(result.items[0]?.errors[0]).toContain("MCP is not enabled")
    expect(mockDb.subsubsection.findFirst).not.toHaveBeenCalled()
  })

  test("update upserts drafts, does not write the measure, returns url and proposed", async () => {
    const written = await updateSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [
        item({
          lengthM: 185.4,
          extraFields: { klassifizierung: "Landesstraße" },
        }),
      ],
    })

    expect(written.draftedCount).toBe(1)
    expect(written.items[0]).toMatchObject({
      drafted: true,
      slug: "dre34",
      url: "http://127.0.0.1:4000/frm9-ra3/abschnitte/pa8/fuehrung/dre34",
    })
    expect(written.items[0]?.changes).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "lengthM", proposed: 185.4 })]),
    )
    expect(mockDb.mcpDraft.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { subsubsectionId: 10 },
        create: expect.objectContaining({
          createdById: 42,
          projectId: 1,
          subsubsectionId: 10,
          patch: expect.objectContaining({ lengthM: 185.4 }),
        }),
      }),
    )
    expect(mockDb.subsubsection.update).not.toHaveBeenCalled()
  })

  test("second call on the same identity replaces the patch", async () => {
    await updateSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({ lengthM: 1 })],
    })
    await updateSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({ lengthM: 2 })],
    })

    expect(mockDb.mcpDraft.upsert).toHaveBeenCalledTimes(2)
    expect(mockDb.mcpDraft.upsert.mock.calls[1]?.[0].update.patch).toEqual({ lengthM: 2 })
  })

  test("one failed item does not block another", async () => {
    mockDb.subsubsection.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockSubsubsection({ id: 11, slug: "ok" }))

    const result = await updateSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({ lengthM: 1 }, "missing"), item({ lengthM: 200 }, "ok")],
    })

    expect(result.draftedCount).toBe(1)
    expect(result.items[0]?.drafted).toBe(false)
    expect(result.items[1]?.drafted).toBe(true)
    expect(result.items[1]?.slug).toBe("ok")
  })

  test("last duplicate identity in one call wins", async () => {
    await updateSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [item({ lengthM: 1 }), item({ lengthM: 99 })],
    })

    expect(mockDb.mcpDraft.upsert).toHaveBeenCalledTimes(1)
    expect(mockDb.mcpDraft.upsert.mock.calls[0]?.[0].create.patch).toEqual({ lengthM: 99 })
  })
})
