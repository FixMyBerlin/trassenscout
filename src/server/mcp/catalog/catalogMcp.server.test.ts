import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest"
import { catalogConfigs } from "@/src/server/mcp/catalog/catalogMcp.config"

const mockDb = {
  project: { findUnique: vi.fn() },
  operator: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  subsection: { count: vi.fn() },
  surveyResponse: { count: vi.fn() },
  subsubsection: { count: vi.fn() },
}

vi.mock("@/src/server/db.server", () => ({ default: mockDb }))

const draftProject = {
  id: 1,
  slug: "frm9",
  mcpMode: "DRAFT",
  mcpDirectUntil: null,
  subsubsectionExtraFieldDefinitions: [],
}

const directProject = { ...draftProject, mcpMode: "DIRECT", mcpDirectUntil: new Date("2099-01-01") }

beforeEach(() => {
  vi.clearAllMocks()
  mockDb.project.findUnique.mockResolvedValue(draftProject)
  mockDb.operator.findFirst.mockResolvedValue(null)
  mockDb.subsection.count.mockResolvedValue(0)
  mockDb.surveyResponse.count.mockResolvedValue(0)
})

const operators = catalogConfigs.operators

describe("catalog MCP", () => {
  let createCatalogForMcp: (typeof import("./catalogMcp.server"))["createCatalogForMcp"]
  let updateCatalogForMcp: (typeof import("./catalogMcp.server"))["updateCatalogForMcp"]
  let deleteCatalogForMcp: (typeof import("./catalogMcp.server"))["deleteCatalogForMcp"]

  beforeAll(async () => {
    ;({ createCatalogForMcp, updateCatalogForMcp, deleteCatalogForMcp } =
      await import("./catalogMcp.server"))
  })
  test("rejects a slug that already exists", async () => {
    mockDb.project.findUnique.mockResolvedValue(directProject)
    mockDb.operator.findFirst.mockResolvedValue({ id: 9, slug: "stadt", title: "Stadt" })
    const result = await createCatalogForMcp(operators, {
      items: [{ projectSlug: "frm9", slug: "stadt", title: "Stadtwerke" }],
      origin: "http://localhost",
      createdById: 1,
    })
    expect(result.items[0]?.errors[0]).toMatch(/existiert bereits/)
    expect(mockDb.operator.create).not.toHaveBeenCalled()
  })

  test("DRAFT create is refused", async () => {
    const result = await createCatalogForMcp(operators, {
      items: [{ projectSlug: "frm9", slug: "stadt", title: "Stadt" }],
      origin: "http://localhost",
      createdById: 1,
    })
    expect(result.items[0]?.mode).toBeNull()
    expect(result.items[0]?.errors[0]).toMatch(/direct write/)
    expect(mockDb.operator.create).not.toHaveBeenCalled()
  })

  test("DIRECT create writes the live row", async () => {
    mockDb.project.findUnique.mockResolvedValue(directProject)
    mockDb.operator.create.mockResolvedValue({ id: 3, slug: "stadt", title: "Stadt" })
    const result = await createCatalogForMcp(operators, {
      items: [{ projectSlug: "frm9", slug: "stadt", title: "Stadt" }],
      origin: "http://localhost",
      createdById: 1,
    })
    expect(result.items[0]?.mode).toBe("applied")
    expect(mockDb.operator.create).toHaveBeenCalled()
  })

  test("update of an unknown slug is an error", async () => {
    mockDb.project.findUnique.mockResolvedValue(directProject)
    const result = await updateCatalogForMcp(operators, {
      projectSlug: "frm9",
      slug: "fehlt",
      patch: { title: "Neu" },
      origin: "http://localhost",
      createdById: 1,
    })
    expect(result.errors[0]).toMatch(/nicht gefunden/)
    expect(mockDb.operator.update).not.toHaveBeenCalled()
  })

  test("DRAFT update is refused", async () => {
    mockDb.operator.findFirst.mockResolvedValue({ id: 3, slug: "stadt", title: "Stadt" })
    const result = await updateCatalogForMcp(operators, {
      projectSlug: "frm9",
      slug: "stadt",
      patch: { title: "Neu" },
      origin: "http://localhost",
      createdById: 1,
    })
    expect(result.mode).toBeNull()
    expect(result.errors[0]).toMatch(/direct write/)
    expect(mockDb.operator.update).not.toHaveBeenCalled()
  })

  test("delete without confirm writes nothing", async () => {
    mockDb.project.findUnique.mockResolvedValue(directProject)
    mockDb.operator.findFirst.mockResolvedValue({ id: 3, slug: "stadt", title: "Stadt" })
    const result = await deleteCatalogForMcp(operators, {
      items: [{ projectSlug: "frm9", slug: "stadt" }],
      origin: "http://localhost",
      createdById: 1,
    })
    expect(result.items[0]?.deleted).toBe(false)
    expect(mockDb.operator.delete).not.toHaveBeenCalled()
  })

  test("delete confirm refuses while a Planungsabschnitt still references the row", async () => {
    mockDb.project.findUnique.mockResolvedValue(directProject)
    mockDb.operator.findFirst.mockResolvedValue({ id: 3, slug: "stadt", title: "Stadt" })
    mockDb.subsection.count.mockResolvedValue(2)
    const result = await deleteCatalogForMcp(operators, {
      items: [{ projectSlug: "frm9", slug: "stadt" }],
      confirm: true,
      origin: "http://localhost",
      createdById: 1,
    })
    expect(result.items[0]?.deleted).toBe(false)
    expect(result.items[0]?.errors[0]).toMatch(/nicht gelöscht/)
    expect(mockDb.operator.delete).not.toHaveBeenCalled()
  })
})
