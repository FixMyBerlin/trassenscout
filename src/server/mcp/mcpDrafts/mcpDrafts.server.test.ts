import { beforeEach, describe, expect, test, vi } from "vitest"
import { McpDraftKind, Prisma } from "@/src/prisma/generated/client"

const mockDb = {
  subsection: { findFirst: vi.fn() },
  project: { findUnique: vi.fn() },
  mcpDraft: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  operator: { findFirst: vi.fn() },
  networkHierarchy: { findFirst: vi.fn() },
  subsectionStatus: { findFirst: vi.fn() },
}

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: {
    admin: vi.fn().mockResolvedValue(undefined),
  },
}))

const headers = new Headers()

describe("mcpDrafts.server subsection drafts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDb.operator.findFirst.mockResolvedValue(null)
    mockDb.networkHierarchy.findFirst.mockResolvedValue(null)
    mockDb.subsectionStatus.findFirst.mockResolvedValue(null)
  })

  test("getSubsectionMcpDraft returns update draft for existing subsection", async () => {
    const { getSubsectionMcpDraft } = await import("@/src/server/mcp/mcpDrafts/mcpDrafts.server")

    mockDb.subsection.findFirst.mockResolvedValue({ id: 10, projectId: 1 })
    mockDb.mcpDraft.findUnique.mockResolvedValue({
      id: 5,
      updatedAt: new Date("2026-01-01"),
      patch: { lengthM: 200 },
      createdBy: { firstName: "A", lastName: "B", email: "a@example.com" },
    })

    const draft = await getSubsectionMcpDraft(headers, { projectSlug: "rs23", slug: "pa8" })

    expect(draft).toMatchObject({
      id: 5,
      kind: "update",
      slug: "pa8",
      formOverlay: { lengthM: 200 },
      overlayErrors: [],
    })
    expect(mockDb.mcpDraft.findUnique).toHaveBeenCalledWith({
      where: { subsectionId: 10 },
      select: expect.any(Object),
    })
  })

  test("getSubsectionMcpDraft returns create draft when subsection does not exist", async () => {
    const { getSubsectionMcpDraft } = await import("@/src/server/mcp/mcpDrafts/mcpDrafts.server")

    mockDb.subsection.findFirst.mockResolvedValue(null)
    mockDb.project.findUnique.mockResolvedValue({ id: 1 })
    mockDb.mcpDraft.findFirst.mockResolvedValue({
      id: 6,
      slug: "pa-new",
      updatedAt: new Date("2026-01-02"),
      patch: {
        type: "LINE",
        geometry: {
          type: "LineString",
          coordinates: [
            [9.19, 48.89],
            [9.2, 48.9],
          ],
        },
        description: "Neu",
      },
      createdBy: { firstName: "A", lastName: "B", email: "a@example.com" },
    })

    const draft = await getSubsectionMcpDraft(headers, { projectSlug: "rs23", slug: "pa-new" })

    expect(draft).toMatchObject({
      id: 6,
      kind: "create",
      slug: "pa-new",
      formOverlay: {
        slug: "pa-new",
        type: "LINE",
        description: "Neu",
      },
      overlayErrors: [],
    })
  })

  test("getSubsectionMcpDraft surfaces overlay errors for stale relation slugs", async () => {
    const { getSubsectionMcpDraft } = await import("@/src/server/mcp/mcpDrafts/mcpDrafts.server")

    mockDb.subsection.findFirst.mockResolvedValue({ id: 10, projectId: 1 })
    mockDb.mcpDraft.findUnique.mockResolvedValue({
      id: 5,
      updatedAt: new Date("2026-01-01"),
      patch: { operatorSlug: "gone" },
      createdBy: { firstName: "A", lastName: "B", email: "a@example.com" },
    })
    mockDb.operator.findFirst.mockResolvedValue(null)

    const draft = await getSubsectionMcpDraft(headers, { projectSlug: "rs23", slug: "pa8" })

    expect(draft?.overlayErrors[0]).toContain("Unknown operatorSlug")
    expect(draft?.formOverlay).toEqual({})
  })

  test("listMcpDraftsGrouped maps subsection create slug to subsectionSlug", async () => {
    const { listMcpDraftsGrouped } = await import("@/src/server/mcp/mcpDrafts/mcpDrafts.server")

    mockDb.mcpDraft.findMany.mockResolvedValue([
      {
        id: 1,
        kind: McpDraftKind.SUBSECTION_CREATE,
        updatedAt: new Date("2026-01-01"),
        slug: "pa-new",
        createdBy: { firstName: "A", lastName: "B", email: "a@example.com" },
        project: { slug: "rs23", subTitle: "Test" },
        parentSubsection: null,
        subsection: null,
        subsubsection: null,
      },
      {
        id: 2,
        kind: McpDraftKind.SUBSECTION_UPDATE,
        updatedAt: new Date("2026-01-02"),
        slug: null,
        createdBy: { firstName: "A", lastName: "B", email: "a@example.com" },
        project: { slug: "rs23", subTitle: "Test" },
        parentSubsection: null,
        subsection: { slug: "pa8" },
        subsubsection: null,
      },
    ])

    const result = await listMcpDraftsGrouped(headers)

    expect(result.groups[0]?.drafts).toEqual([
      expect.objectContaining({
        kind: McpDraftKind.SUBSECTION_CREATE,
        subsectionSlug: "pa-new",
        subsubsectionSlug: null,
      }),
      expect.objectContaining({
        kind: McpDraftKind.SUBSECTION_UPDATE,
        subsectionSlug: "pa8",
        subsubsectionSlug: null,
      }),
    ])
  })

  test("upsertSubsectionMcpCreateDraft retries on unique constraint race", async () => {
    const { upsertSubsectionMcpCreateDraft } =
      await import("@/src/server/mcp/mcpDrafts/mcpDrafts.server")

    mockDb.mcpDraft.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint", {
        code: "P2002",
        clientVersion: "test",
      }),
    )
    mockDb.mcpDraft.findFirst.mockResolvedValue({ id: 9 })
    mockDb.mcpDraft.update.mockResolvedValue({ id: 9 })

    const result = await upsertSubsectionMcpCreateDraft({
      createdById: 42,
      projectId: 1,
      slug: "pa8",
      patch: { type: "LINE", geometry: { type: "LineString", coordinates: [[9, 48]] } },
    })

    expect(result).toEqual({ id: 9 })
    expect(mockDb.mcpDraft.update).toHaveBeenCalledWith({
      where: { id: 9 },
      data: expect.objectContaining({
        createdById: 42,
        patch: expect.objectContaining({ type: "LINE" }),
      }),
    })
  })
})
