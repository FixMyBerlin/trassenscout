import { beforeEach, describe, expect, test, vi } from "vitest"

const mockDb = {
  operator: { findFirst: vi.fn() },
  networkHierarchy: { findFirst: vi.fn() },
  subsectionStatus: { findFirst: vi.fn() },
}

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

describe("overlaySubsectionMcpDraft", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("drops unknown extra keys", async () => {
    const { overlaySubsectionMcpDraft } =
      await import("@/src/server/mcp/subsectionUpdate/overlaySubsectionMcpDraft")

    mockDb.operator.findFirst.mockResolvedValue({ id: 3 })

    const result = await overlaySubsectionMcpDraft({
      projectId: 1,
      patch: {
        lengthM: 200,
        operatorSlug: "stadt",
        unknownField: "nope",
        priority: "HIGH",
      },
    })

    expect(result).toEqual({
      overlay: {
        lengthM: 200,
        operatorId: 3,
      },
      overlayErrors: [],
    })
  })

  test("collects relation slug errors instead of throwing", async () => {
    const { overlaySubsectionMcpDraft } =
      await import("@/src/server/mcp/subsectionUpdate/overlaySubsectionMcpDraft")

    mockDb.operator.findFirst.mockResolvedValue(null)

    const result = await overlaySubsectionMcpDraft({
      projectId: 1,
      patch: { lengthM: 200, operatorSlug: "gone" },
    })

    expect(result.overlay).toEqual({ lengthM: 200 })
    expect(result.overlayErrors[0]).toContain("Unknown operatorSlug")
  })

  test("returns empty overlay when nothing usable remains", async () => {
    const { overlaySubsectionMcpDraft } =
      await import("@/src/server/mcp/subsectionUpdate/overlaySubsectionMcpDraft")

    const result = await overlaySubsectionMcpDraft({
      projectId: 1,
      patch: { unknownField: "x" },
    })

    expect(result).toEqual({ overlay: {}, overlayErrors: [] })
  })

  test("overlays type and geometry only for create drafts", async () => {
    const { overlaySubsectionMcpDraft } =
      await import("@/src/server/mcp/subsectionUpdate/overlaySubsectionMcpDraft")

    const geometry = {
      type: "LineString" as const,
      coordinates: [
        [9.1943, 48.8932],
        [9.2043, 48.8933],
      ],
    }

    const createResult = await overlaySubsectionMcpDraft({
      projectId: 1,
      createDraft: true,
      patch: {
        type: "LINE",
        geometry,
        description: "Neu",
      },
    })

    expect(createResult).toEqual({
      overlay: {
        type: "LINE",
        geometry,
        description: "Neu",
      },
      overlayErrors: [],
    })

    const updateResult = await overlaySubsectionMcpDraft({
      projectId: 1,
      createDraft: false,
      patch: {
        type: "LINE",
        geometry,
        description: "Neu",
      },
    })

    expect(updateResult).toEqual({
      overlay: {
        description: "Neu",
      },
      overlayErrors: [],
    })
  })
})
