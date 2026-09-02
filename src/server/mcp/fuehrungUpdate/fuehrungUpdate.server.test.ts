import { beforeEach, describe, expect, test, vi } from "vitest"
import { LabelPositionEnum } from "@/src/prisma/generated/browser"

const mockDb = {
  project: { findUnique: vi.fn() },
  subsubsection: { findFirst: vi.fn(), update: vi.fn(), findMany: vi.fn() },
  qualityLevel: { findFirst: vi.fn() },
  subsubsectionStatus: { findFirst: vi.fn() },
  subsubsectionTask: { findFirst: vi.fn() },
  subsubsectionInfra: { findFirst: vi.fn() },
  subsubsectionInfrastructureType: { findFirst: vi.fn() },
}

const createLogEntry = vi.fn()

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

vi.mock("@/src/server/logEntries/create/createLogEntry", () => ({
  createLogEntry,
}))

const enabledProject = {
  id: 1,
  slug: "frm9-ra3",
  mcpEnabled: true,
  subsubsectionExtraFieldDefinitions: [
    { name: "klassifizierung", label: "Klassifizierung", order: 0 },
  ],
}

function mockFuehrung(overrides: Record<string, unknown> = {}) {
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
  origin: "http://127.0.0.1:4000",
}

describe("Führung MCP patch", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDb.project.findUnique.mockResolvedValue(enabledProject)
    mockDb.subsubsection.findFirst.mockResolvedValue(mockFuehrung())
  })

  test("preview diffs set vs overwrite and warns only for overwrite", async () => {
    const { previewFuehrungUpdateForMcp } =
      await import("@/src/server/mcp/queries/updateFuehrungForMcp.server")

    const result = await previewFuehrungUpdateForMcp({
      ...identity,
      patch: {
        lengthM: 185.4,
        extraFields: { klassifizierung: "Landesstraße" },
      },
    })

    expect(result.okToWrite).toBe(true)
    expect(result.changes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "lengthM",
          kind: "overwrite",
          current: 120,
          proposed: 185.4,
        }),
        expect.objectContaining({
          field: "extraFields.klassifizierung",
          kind: "set",
          current: null,
          proposed: "Landesstraße",
        }),
      ]),
    )
    expect(result.warnings.some((warning) => warning.includes("Länge"))).toBe(true)
    expect(result.errors).toEqual([])
  })

  test("unknown extra field key and empty string are errors", async () => {
    const { previewFuehrungUpdateForMcp } =
      await import("@/src/server/mcp/queries/updateFuehrungForMcp.server")

    const unknown = await previewFuehrungUpdateForMcp({
      ...identity,
      patch: { extraFields: { unknown: "x" } },
    })
    expect(unknown.okToWrite).toBe(false)
    expect(unknown.errors[0]).toContain("Unknown extraFields key")

    const empty = await previewFuehrungUpdateForMcp({
      ...identity,
      patch: { extraFields: { klassifizierung: "" } },
    })
    expect(empty.okToWrite).toBe(false)
    expect(empty.errors[0]).toContain("empty string")
  })

  test("empty or unchanged patch is not okToWrite and does not update", async () => {
    const { previewFuehrungUpdateForMcp, updateFuehrungForMcp } =
      await import("@/src/server/mcp/queries/updateFuehrungForMcp.server")

    const empty = await previewFuehrungUpdateForMcp({ ...identity, patch: {} })
    expect(empty.okToWrite).toBe(false)
    expect(empty.changes).toEqual([])

    const unchanged = await previewFuehrungUpdateForMcp({ ...identity, patch: { lengthM: 120 } })
    expect(unchanged.okToWrite).toBe(false)
    expect(unchanged.changes).toEqual([])

    const noWrite = await updateFuehrungForMcp({
      ...identity,
      patch: { lengthM: 120 },
      confirm: true,
      createdById: 42,
    })
    expect(noWrite.written).toBe(false)
    expect(mockDb.subsubsection.update).not.toHaveBeenCalled()
    expect(createLogEntry).not.toHaveBeenCalled()
  })

  test("null is rejected by the patch schema", async () => {
    const { fuehrungMcpPatchSchema } = await import("@/src/server/mcp/fuehrungUpdate/patchSchema")
    expect(fuehrungMcpPatchSchema.safeParse({ lengthM: null }).success).toBe(false)
    expect(fuehrungMcpPatchSchema.safeParse({ description: "" }).success).toBe(false)
    expect(fuehrungMcpPatchSchema.safeParse({ managerId: 1 }).success).toBe(false)
    expect(fuehrungMcpPatchSchema.safeParse({ labelPos: "bottom" }).success).toBe(false)
    expect(fuehrungMcpPatchSchema.safeParse({ lengthM: Number.NaN }).success).toBe(false)
    expect(
      fuehrungMcpPatchSchema.safeParse({ subsubsectionInfrastructureTypeSlugs: [] }).success,
    ).toBe(false)
    expect(
      fuehrungMcpPatchSchema.safeParse({
        extraFields: { klassifizierung: "x".repeat(10_001) },
      }).success,
    ).toBe(false)
  })

  test("missing führung throws before write", async () => {
    const { previewFuehrungUpdateForMcp } =
      await import("@/src/server/mcp/queries/updateFuehrungForMcp.server")
    mockDb.subsubsection.findFirst.mockResolvedValue(null)
    await expect(
      previewFuehrungUpdateForMcp({ ...identity, patch: { lengthM: 1 } }),
    ).rejects.toThrow("Führung not found")
  })

  test("unknown relation slug returns an error instead of throwing", async () => {
    const { previewFuehrungUpdateForMcp } =
      await import("@/src/server/mcp/queries/updateFuehrungForMcp.server")
    mockDb.qualityLevel.findFirst.mockResolvedValue(null)
    const result = await previewFuehrungUpdateForMcp({
      ...identity,
      patch: { qualityLevelSlug: "missing" },
    })
    expect(result.okToWrite).toBe(false)
    expect(result.errors[0]).toContain("Unknown qualityLevelSlug")
  })

  test("M2M slugs full-replace", async () => {
    const { previewFuehrungUpdateForMcp } =
      await import("@/src/server/mcp/queries/updateFuehrungForMcp.server")
    mockDb.subsubsection.findFirst.mockResolvedValue(
      mockFuehrung({
        SubsubsectionInfrastructureTypes: [{ id: 1, slug: "old" }],
      }),
    )
    mockDb.subsubsectionInfrastructureType.findFirst.mockResolvedValue({ id: 2 })

    const result = await previewFuehrungUpdateForMcp({
      ...identity,
      patch: { subsubsectionInfrastructureTypeSlugs: ["new"] },
    })
    expect(result.changes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "subsubsectionInfrastructureTypeSlugs",
          kind: "overwrite",
          current: ["old"],
          proposed: ["new"],
        }),
      ]),
    )
  })

  test("disabled project does not read führungen", async () => {
    const { previewFuehrungUpdateForMcp } =
      await import("@/src/server/mcp/queries/updateFuehrungForMcp.server")
    mockDb.project.findUnique.mockResolvedValue({ ...enabledProject, mcpEnabled: false })
    await expect(
      previewFuehrungUpdateForMcp({ ...identity, patch: { lengthM: 1 } }),
    ).rejects.toThrow("MCP is not enabled")
    expect(mockDb.subsubsection.findFirst).not.toHaveBeenCalled()
  })

  test("update requires confirm, merges extraFields, logs createdById, does not create", async () => {
    const { updateFuehrungForMcp } =
      await import("@/src/server/mcp/queries/updateFuehrungForMcp.server")

    await expect(
      updateFuehrungForMcp({
        ...identity,
        patch: { lengthM: 185.4 },
        confirm: false,
        createdById: 42,
      }),
    ).rejects.toThrow("confirm: true")
    expect(mockDb.subsubsection.findFirst).not.toHaveBeenCalled()
    expect(mockDb.subsubsection.update).not.toHaveBeenCalled()

    mockDb.subsubsection.findFirst.mockResolvedValue(
      mockFuehrung({ extraFields: { klassifizierung: "Kreisstraße" } }),
    )
    mockDb.subsubsection.update.mockResolvedValue(mockFuehrung({ lengthM: 185.4 }))

    const written = await updateFuehrungForMcp({
      ...identity,
      patch: {
        lengthM: 185.4,
        extraFields: { klassifizierung: "Landesstraße" },
      },
      confirm: true,
      createdById: 42,
    })

    expect(written.written).toBe(true)
    expect(mockDb.subsubsection.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 10 },
        data: expect.objectContaining({
          lengthM: 185.4,
          extraFields: { klassifizierung: "Landesstraße" },
        }),
      }),
    )
    expect(createLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "UPDATE",
        userId: 42,
        subsubsectionId: 10,
      }),
    )
    expect(mockDb.subsubsection.findFirst).toHaveBeenCalled()
  })
})
