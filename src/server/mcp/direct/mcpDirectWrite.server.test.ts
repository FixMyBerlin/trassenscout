import { beforeEach, describe, expect, test, vi } from "vitest"
import { LabelPositionEnum } from "@/src/prisma/generated/browser"

const mockCreateLogEntry = vi.fn().mockResolvedValue(undefined)

const mockDb = {
  project: { findUnique: vi.fn() },
  subsubsection: { findFirst: vi.fn(), update: vi.fn(), create: vi.fn(), delete: vi.fn() },
  subsection: {
    findFirst: vi.fn(),
    findFirstOrThrow: vi.fn(),
    aggregate: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  qualityLevel: { findFirst: vi.fn() },
  subsubsectionStatus: { findFirst: vi.fn() },
  subsubsectionTask: { findFirst: vi.fn() },
  subsubsectionInfra: { findFirst: vi.fn() },
  subsubsectionInfrastructureType: { findFirst: vi.fn() },
  mcpDraft: { upsert: vi.fn(), deleteMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn() },
}

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

vi.mock("@/src/server/logEntries/create/createLogEntry", () => ({
  createLogEntry: (...args: unknown[]) => mockCreateLogEntry(...args),
}))

const directUntil = new Date("2099-01-01T00:00:00.000Z")

const draftProject = {
  id: 1,
  slug: "frm9-ra3",
  mcpMode: "DRAFT" as const,
  mcpDirectUntil: null,
  subsubsectionExtraFieldDefinitions: [],
}

const directProject = {
  ...draftProject,
  mcpMode: "DIRECT" as const,
  mcpDirectUntil: directUntil,
}

function mockMeasure(overrides: Record<string, unknown> = {}) {
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
    grantAmount: null,
    ownFunds: null,
    grantsOtherFunding: null,
    revenuesEconomicIncome: null,
    contributionsThirdParties: null,
    remainingFunding: null,
    disbursedFunding: null,
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
    _count: { projectRecords: 0, uploads: 0, acquisitionAreas: 0 },
    ...overrides,
  }
}

const line = {
  type: "LineString" as const,
  coordinates: [
    [8, 50],
    [8.1, 50.1],
  ] as [number, number][],
}

const updateItem = {
  projectSlug: "frm9-ra3",
  subsectionSlug: "pa8",
  slug: "dre34",
  patch: { lengthM: 200 },
}

describe("MCP direct write", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDb.mcpDraft.upsert.mockResolvedValue({ id: 1 })
    mockDb.mcpDraft.deleteMany.mockResolvedValue({ count: 1 })
    mockDb.subsubsection.update.mockResolvedValue(mockMeasure({ lengthM: 200 }))
    mockDb.subsubsection.create.mockResolvedValue(mockMeasure({ id: 11, slug: "neu1" }))
    mockDb.subsubsection.delete.mockResolvedValue(mockMeasure())
    mockDb.subsection.delete.mockResolvedValue({ id: 3 })
    mockDb.subsection.aggregate.mockResolvedValue({ _max: { order: 4 } })
    mockDb.subsection.create.mockResolvedValue({
      id: 4,
      projectId: 1,
      slug: "neu-pa",
      order: 5,
      type: "LINE",
      geometry: line,
      labelPos: LabelPositionEnum.bottom,
      description: null,
      lengthM: null,
      managerId: null,
      operatorId: null,
      networkHierarchyId: null,
      subsectionStatusId: null,
      estimatedCompletionDateString: null,
    })
    mockDb.subsection.update.mockResolvedValue({
      id: 3,
      slug: "pa8",
      order: 1,
      type: "LINE",
      geometry: {},
      labelPos: LabelPositionEnum.bottom,
      description: "neu",
      lengthM: 50,
      managerId: null,
      operatorId: null,
      networkHierarchyId: null,
      subsectionStatusId: null,
      estimatedCompletionDateString: null,
    })
    mockDb.mcpDraft.findFirst.mockResolvedValue(null)
    mockDb.mcpDraft.findUnique.mockResolvedValue(null)
  })

  test("update drafts when the effective mode is drafts", async () => {
    const { updateSubsubsectionForMcp } =
      await import("@/src/server/mcp/queries/updateSubsubsectionForMcp.server")
    mockDb.project.findUnique.mockResolvedValue(draftProject)
    mockDb.subsubsection.findFirst.mockResolvedValue(mockMeasure())

    const result = await updateSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [updateItem],
    })

    expect(result.items[0]?.mode).toBe("drafted")
    expect(result.draftedCount).toBe(1)
    expect(result.appliedCount).toBe(0)
    expect(mockDb.mcpDraft.upsert).toHaveBeenCalled()
    expect(mockDb.subsubsection.update).not.toHaveBeenCalled()
    expect(mockCreateLogEntry).not.toHaveBeenCalled()
  })

  test("update writes the measure when direct write is still active", async () => {
    const { updateSubsubsectionForMcp } =
      await import("@/src/server/mcp/queries/updateSubsubsectionForMcp.server")
    mockDb.project.findUnique.mockResolvedValue(directProject)
    mockDb.subsubsection.findFirst.mockResolvedValue(mockMeasure())

    const result = await updateSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [updateItem],
    })

    expect(result.items[0]?.mode).toBe("applied")
    expect(result.appliedCount).toBe(1)
    expect(mockDb.subsubsection.update).toHaveBeenCalled()
    expect(mockDb.mcpDraft.deleteMany).toHaveBeenCalledWith({ where: { subsubsectionId: 10 } })
    expect(mockDb.mcpDraft.upsert).not.toHaveBeenCalled()
    expect(mockCreateLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "UPDATE",
        message: "Maßnahme »DRE34« wurde bearbeitet.",
        userId: 42,
        subsubsectionId: 10,
      }),
    )
    expect(JSON.stringify(mockCreateLogEntry.mock.calls)).not.toContain("MCP")
  })

  test("expired direct write falls back to a draft", async () => {
    const { updateSubsubsectionForMcp } =
      await import("@/src/server/mcp/queries/updateSubsubsectionForMcp.server")
    mockDb.project.findUnique.mockResolvedValue({
      ...directProject,
      mcpDirectUntil: new Date("2020-01-01T00:00:00.000Z"),
    })
    mockDb.subsubsection.findFirst.mockResolvedValue(mockMeasure())

    const result = await updateSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [updateItem],
    })

    expect(result.items[0]?.mode).toBe("drafted")
    expect(mockDb.subsubsection.update).not.toHaveBeenCalled()
  })

  test("create writes the measure and drops the create draft", async () => {
    const { createSubsubsectionForMcp } =
      await import("@/src/server/mcp/queries/createSubsubsectionForMcp.server")
    mockDb.project.findUnique.mockResolvedValue(directProject)
    mockDb.subsection.findFirst.mockResolvedValue({ id: 1, slug: "pa8" })
    mockDb.subsubsection.findFirst.mockResolvedValue(null)

    const result = await createSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [
        {
          projectSlug: "frm9-ra3",
          subsectionSlug: "pa8",
          slug: "neu1",
          patch: { type: "LINE", geometry: line, lengthM: 12 },
        },
      ],
    })

    expect(result.items[0]?.mode).toBe("applied")
    expect(result.items[0]?.url).toBe("http://127.0.0.1:4000/frm9-ra3/abschnitte/pa8/fuehrung/neu1")
    expect(result.appliedCount).toBe(1)
    expect(mockDb.subsubsection.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: "neu1", subsectionId: 1, lengthM: 12 }),
      }),
    )
    expect(mockDb.mcpDraft.deleteMany).toHaveBeenCalledWith({
      where: { kind: "SUBSUBSECTION_CREATE", parentSubsectionId: 1, slug: "neu1" },
    })
    expect(mockCreateLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "CREATE",
        message: "Neue Maßnahme »NEU1« wurde erstellt.",
      }),
    )
  })

  test("create drafts the measure when the effective mode is drafts", async () => {
    const { createSubsubsectionForMcp } =
      await import("@/src/server/mcp/queries/createSubsubsectionForMcp.server")
    mockDb.project.findUnique.mockResolvedValue(draftProject)
    mockDb.subsection.findFirst.mockResolvedValue({ id: 1, slug: "pa8" })
    mockDb.subsubsection.findFirst.mockResolvedValue(null)

    const result = await createSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [
        {
          projectSlug: "frm9-ra3",
          subsectionSlug: "pa8",
          slug: "neu1",
          patch: { type: "LINE", geometry: line },
        },
      ],
    })

    expect(result.items[0]?.mode).toBe("drafted")
    expect(mockDb.mcpDraft.upsert).toHaveBeenCalled()
    expect(mockDb.subsubsection.create).not.toHaveBeenCalled()
  })

  test("subsection update writes immediately in direct mode", async () => {
    const { updateSubsectionForMcp } =
      await import("@/src/server/mcp/queries/updateSubsectionForMcp.server")
    const pa = {
      id: 3,
      slug: "pa8",
      order: 1,
      type: "LINE",
      geometry: {},
      labelPos: LabelPositionEnum.bottom,
      description: null,
      lengthM: null,
      managerId: null,
      operatorId: null,
      networkHierarchyId: null,
      subsectionStatusId: null,
      estimatedCompletionDateString: null,
      operator: null,
      networkHierarchy: null,
      SubsectionStatus: null,
    }
    mockDb.project.findUnique.mockResolvedValue(directProject)
    mockDb.subsection.findFirst.mockResolvedValue(pa)
    mockDb.subsection.findFirstOrThrow.mockResolvedValue(pa)

    const result = await updateSubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [{ projectSlug: "frm9-ra3", slug: "pa8", patch: { lengthM: 50 } }],
    })

    expect(result.items[0]?.mode).toBe("applied")
    expect(mockDb.subsection.update).toHaveBeenCalled()
    expect(mockDb.mcpDraft.deleteMany).toHaveBeenCalledWith({ where: { subsectionId: 3 } })
    expect(mockCreateLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "UPDATE",
        message: "Planungsabschnitt »PA8« wurde bearbeitet.",
      }),
    )
  })

  test("subsection create uses the next order in the project", async () => {
    const { createSubsectionForMcp } =
      await import("@/src/server/mcp/queries/createSubsectionForMcp.server")
    mockDb.project.findUnique.mockResolvedValue(directProject)
    mockDb.subsection.findFirst.mockResolvedValue(null)

    const result = await createSubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [
        {
          projectSlug: "frm9-ra3",
          slug: "neu-pa",
          patch: { type: "LINE", geometry: line },
        },
      ],
    })

    expect(result.items[0]?.mode).toBe("applied")
    expect(result.items[0]?.url).toBe("http://127.0.0.1:4000/frm9-ra3/abschnitte/neu-pa")
    expect(mockDb.subsection.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: "neu-pa", projectId: 1, order: 5 }),
      }),
    )
    expect(mockCreateLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "CREATE",
        message: "Neuer Planungsabschnitt »NEU-PA« wurde erstellt.",
      }),
    )
  })

  test("subsection create starts order at 1 when the project has none", async () => {
    const { createSubsectionForMcp } =
      await import("@/src/server/mcp/queries/createSubsectionForMcp.server")
    mockDb.project.findUnique.mockResolvedValue(directProject)
    mockDb.subsection.findFirst.mockResolvedValue(null)
    mockDb.subsection.aggregate.mockResolvedValue({ _max: { order: null } })

    await createSubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [
        {
          projectSlug: "frm9-ra3",
          slug: "neu-pa",
          patch: { type: "LINE", geometry: line },
        },
      ],
    })

    expect(mockDb.subsection.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ order: 1 }) }),
    )
  })

  test("delete preview writes nothing", async () => {
    const { deleteSubsubsectionForMcp } =
      await import("@/src/server/mcp/direct/deleteSubsubsectionForMcp.server")
    mockDb.project.findUnique.mockResolvedValue(directProject)
    mockDb.subsubsection.findFirst.mockResolvedValue(mockMeasure())

    const result = await deleteSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [{ projectSlug: "frm9-ra3", subsectionSlug: "pa8", slug: "dre34" }],
    })

    expect(result.deletedCount).toBe(0)
    expect(result.items[0]).toMatchObject({
      deleted: false,
      projectRecordCount: 0,
      uploadCount: 0,
      acquisitionAreaCount: 0,
    })
    expect(mockDb.subsubsection.delete).not.toHaveBeenCalled()
  })

  test("confirm deletes an empty measure", async () => {
    const { deleteSubsubsectionForMcp } =
      await import("@/src/server/mcp/direct/deleteSubsubsectionForMcp.server")
    mockDb.project.findUnique.mockResolvedValue(directProject)
    mockDb.subsubsection.findFirst.mockResolvedValue(mockMeasure())

    const result = await deleteSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      confirm: true,
      items: [{ projectSlug: "frm9-ra3", subsectionSlug: "pa8", slug: "dre34" }],
    })

    expect(result.items[0]?.deleted).toBe(true)
    expect(mockDb.subsubsection.delete).toHaveBeenCalledWith({ where: { id: 10 } })
    expect(mockCreateLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "DELETE",
        message: "Maßnahme »DRE34« wurde gelöscht.",
        previousRecord: expect.objectContaining({ id: 10, slug: "dre34", lengthM: 120 }),
      }),
    )
  })

  test.each([
    ["projectRecords", { projectRecords: 1, uploads: 0, acquisitionAreas: 0 }],
    ["uploads", { projectRecords: 0, uploads: 2, acquisitionAreas: 0 }],
    ["acquisitionAreas", { projectRecords: 0, uploads: 0, acquisitionAreas: 1 }],
  ])("confirm rejects a measure with %s", async (_label, counts) => {
    const { deleteSubsubsectionForMcp } =
      await import("@/src/server/mcp/direct/deleteSubsubsectionForMcp.server")
    mockDb.project.findUnique.mockResolvedValue(directProject)
    mockDb.subsubsection.findFirst.mockResolvedValue(mockMeasure({ _count: counts }))

    const result = await deleteSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      confirm: true,
      items: [{ projectSlug: "frm9-ra3", subsectionSlug: "pa8", slug: "dre34" }],
    })

    expect(result.items[0]?.deleted).toBe(false)
    expect(result.items[0]?.errors[0]).toContain("kann nicht gelöscht")
    expect(mockDb.subsubsection.delete).not.toHaveBeenCalled()
  })

  test("confirm rejects a Planungsabschnitt that still has Maßnahmen", async () => {
    const { deleteSubsectionForMcp } =
      await import("@/src/server/mcp/direct/deleteSubsectionForMcp.server")
    mockDb.project.findUnique.mockResolvedValue(directProject)
    mockDb.subsection.findFirst.mockResolvedValue({
      id: 3,
      slug: "pa8",
      order: 1,
      type: "LINE",
      geometry: {},
      labelPos: LabelPositionEnum.bottom,
      description: null,
      lengthM: null,
      managerId: null,
      operatorId: null,
      networkHierarchyId: null,
      subsectionStatusId: null,
      estimatedCompletionDateString: null,
      _count: { subsubsections: 2 },
    })

    const result = await deleteSubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      confirm: true,
      items: [{ projectSlug: "frm9-ra3", slug: "pa8" }],
    })

    expect(result.items[0]?.deleted).toBe(false)
    expect(result.items[0]?.errors[0]).toContain("Maßnahme")
    expect(mockDb.subsection.delete).not.toHaveBeenCalled()
  })

  test("subsection delete preview writes nothing and confirm deletes an empty Planungsabschnitt", async () => {
    const { deleteSubsectionForMcp } =
      await import("@/src/server/mcp/direct/deleteSubsectionForMcp.server")
    const emptyPa = {
      id: 3,
      slug: "pa8",
      order: 1,
      type: "LINE",
      geometry: {},
      labelPos: LabelPositionEnum.bottom,
      description: null,
      lengthM: null,
      managerId: null,
      operatorId: null,
      networkHierarchyId: null,
      subsectionStatusId: null,
      estimatedCompletionDateString: null,
      _count: { subsubsections: 0 },
    }
    mockDb.project.findUnique.mockResolvedValue(directProject)
    mockDb.subsection.findFirst.mockResolvedValue(emptyPa)

    const preview = await deleteSubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      items: [{ projectSlug: "frm9-ra3", slug: "pa8" }],
    })
    expect(preview.deletedCount).toBe(0)
    expect(preview.items[0]).toMatchObject({ deleted: false, subsubsectionCount: 0 })
    expect(mockDb.subsection.delete).not.toHaveBeenCalled()

    const confirmed = await deleteSubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      confirm: true,
      items: [{ projectSlug: "frm9-ra3", slug: "pa8" }],
    })
    expect(confirmed.items[0]?.deleted).toBe(true)
    expect(mockDb.subsection.delete).toHaveBeenCalledWith({ where: { id: 3 } })
    expect(mockCreateLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "DELETE",
        message: "Planungsabschnitt »PA8« wurde gelöscht.",
        previousRecord: expect.objectContaining({ id: 3, slug: "pa8" }),
      }),
    )
  })

  test("delete fails when the effective mode is drafts or off", async () => {
    const { deleteSubsubsectionForMcp } =
      await import("@/src/server/mcp/direct/deleteSubsubsectionForMcp.server")

    mockDb.project.findUnique.mockResolvedValue(draftProject)
    const drafted = await deleteSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      confirm: true,
      items: [{ projectSlug: "frm9-ra3", subsectionSlug: "pa8", slug: "dre34" }],
    })
    expect(drafted.items[0]?.errors[0]).toContain("direct write")

    mockDb.project.findUnique.mockResolvedValue({ ...draftProject, mcpMode: "DISABLED" })
    const disabled = await deleteSubsubsectionForMcp({
      origin: "http://127.0.0.1:4000",
      createdById: 42,
      confirm: true,
      items: [{ projectSlug: "frm9-ra3", subsectionSlug: "pa8", slug: "dre34" }],
    })
    expect(disabled.items[0]?.errors[0]).toContain("MCP is not enabled")
    expect(mockDb.subsubsection.delete).not.toHaveBeenCalled()
  })

  test("apply functions refuse a non-direct resolved item", async () => {
    const { applySubsubsectionUpdateForMcp } = await import("./applyMcpDirectWrite.server")

    await expect(
      applySubsubsectionUpdateForMcp(
        {
          mcpMode: "DRAFT",
          projectSlug: "frm9-ra3",
          subsubsectionId: 10,
          prismaData: {},
          previousSnapshot: { id: 10 },
        } as never,
        42,
      ),
    ).rejects.toThrow(/not DIRECT/)
    expect(mockDb.subsubsection.update).not.toHaveBeenCalled()
    expect(mockCreateLogEntry).not.toHaveBeenCalled()
  })

  test("requireMcpDirectProject rejects drafts and disabled", async () => {
    const { requireMcpDirectProject } = await import("./requireMcpDirectProject.server")

    mockDb.project.findUnique.mockResolvedValue(draftProject)
    await expect(requireMcpDirectProject("frm9-ra3")).rejects.toThrow(/direct write/)

    mockDb.project.findUnique.mockResolvedValue({ ...draftProject, mcpMode: "DISABLED" })
    await expect(requireMcpDirectProject("frm9-ra3")).rejects.toThrow(/MCP is not enabled/)

    mockDb.project.findUnique.mockResolvedValue(directProject)
    await expect(requireMcpDirectProject("frm9-ra3")).resolves.toMatchObject({ mcpMode: "DIRECT" })
  })
})
