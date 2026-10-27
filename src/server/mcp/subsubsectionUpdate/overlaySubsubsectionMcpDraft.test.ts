import { beforeEach, describe, expect, test, vi } from "vitest"

const mockDb = {
  qualityLevel: { findFirst: vi.fn() },
  subsubsectionStatus: { findFirst: vi.fn() },
  subsubsectionTask: { findFirst: vi.fn() },
  subsubsectionInfra: { findFirst: vi.fn() },
  subsubsectionInfrastructureType: { findFirst: vi.fn() },
}

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

describe("overlaySubsubsectionMcpDraft", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("drops unknown extra keys", async () => {
    const { overlaySubsubsectionMcpDraft } =
      await import("@/src/server/mcp/subsubsectionUpdate/overlaySubsubsectionMcpDraft")

    mockDb.subsubsectionInfrastructureType.findFirst.mockResolvedValue({ id: 9 })

    const overlay = await overlaySubsubsectionMcpDraft({
      projectId: 1,
      extraFieldDefinitions: [{ name: "klassifizierung", label: "Klassifizierung", order: 0 }],
      currentExtraFields: { klassifizierung: "Kreisstraße" },
      patch: {
        lengthM: 200,
        subsubsectionInfrastructureTypeSlugs: ["keep"],
        extraFields: { klassifizierung: "Landesstraße", removed: "x" },
        unknownField: "nope",
      },
    })

    expect(overlay).toEqual({
      lengthM: 200,
      subsubsectionInfrastructureTypeIds: ["9"],
      extraFields: { klassifizierung: "Landesstraße" },
    })
  })

  test("clear empties the form fields", async () => {
    const { overlaySubsubsectionMcpDraft } =
      await import("@/src/server/mcp/subsubsectionUpdate/overlaySubsubsectionMcpDraft")

    const overlay = await overlaySubsubsectionMcpDraft({
      projectId: 1,
      extraFieldDefinitions: [{ name: "klassifizierung", label: "Klassifizierung", order: 0 }],
      currentExtraFields: { klassifizierung: "Kreisstraße" },
      patch: { clear: ["description", "extraFields.klassifizierung", "extraFields.removed"] },
    })

    expect(overlay).toEqual({ description: null, extraFields: { klassifizierung: "" } })

    const createOverlay = await overlaySubsubsectionMcpDraft({
      projectId: 1,
      extraFieldDefinitions: [],
      currentExtraFields: {},
      createDraft: true,
      patch: { withoutGeometry: true, clear: ["description"] },
    })
    expect(createOverlay).not.toHaveProperty("description")
  })

  test("a withoutGeometry create draft ticks the checkbox and clears type and geometry", async () => {
    const { overlaySubsubsectionMcpDraft } =
      await import("@/src/server/mcp/subsubsectionUpdate/overlaySubsubsectionMcpDraft")

    const overlay = await overlaySubsubsectionMcpDraft({
      projectId: 1,
      extraFieldDefinitions: [],
      currentExtraFields: {},
      patch: { withoutGeometry: true },
    })

    expect(overlay).toEqual({ withoutGeometry: true, type: null, geometry: null })
  })

  test("a geometry without type gets its type from the GeoJSON type", async () => {
    const { overlaySubsubsectionMcpDraft } =
      await import("@/src/server/mcp/subsubsectionUpdate/overlaySubsubsectionMcpDraft")
    const geometry = { type: "Point" as const, coordinates: [9.19, 48.89] as [number, number] }

    const overlay = await overlaySubsubsectionMcpDraft({
      projectId: 1,
      extraFieldDefinitions: [],
      currentExtraFields: {},
      patch: { geometry },
    })

    expect(overlay).toEqual({ geometry, type: "POINT" })
  })

  test("throws when a relation slug does not resolve", async () => {
    const { overlaySubsubsectionMcpDraft } =
      await import("@/src/server/mcp/subsubsectionUpdate/overlaySubsubsectionMcpDraft")

    mockDb.qualityLevel.findFirst.mockResolvedValue(null)

    await expect(
      overlaySubsubsectionMcpDraft({
        projectId: 1,
        extraFieldDefinitions: [],
        currentExtraFields: {},
        patch: { lengthM: 200, qualityLevelSlug: "gone" },
      }),
    ).rejects.toThrow("Unknown qualityLevelSlug")
  })

  test("throws when an infrastructure type slug does not resolve", async () => {
    const { overlaySubsubsectionMcpDraft } =
      await import("@/src/server/mcp/subsubsectionUpdate/overlaySubsubsectionMcpDraft")

    mockDb.subsubsectionInfrastructureType.findFirst
      .mockResolvedValueOnce({ id: 9 })
      .mockResolvedValueOnce(null)

    await expect(
      overlaySubsubsectionMcpDraft({
        projectId: 1,
        extraFieldDefinitions: [],
        currentExtraFields: {},
        patch: { subsubsectionInfrastructureTypeSlugs: ["keep", "gone"] },
      }),
    ).rejects.toThrow("Unknown subsubsectionInfrastructureTypeSlugs")
  })

  test("returns empty overlay when nothing usable remains", async () => {
    const { overlaySubsubsectionMcpDraft } =
      await import("@/src/server/mcp/subsubsectionUpdate/overlaySubsubsectionMcpDraft")

    const overlay = await overlaySubsubsectionMcpDraft({
      projectId: 1,
      extraFieldDefinitions: [],
      currentExtraFields: {},
      patch: { extraFields: { gone: "x" } },
    })

    expect(overlay).toEqual({})
  })

  test("applies a JSON-serialized patch as stored on McpDraft", async () => {
    const { overlaySubsubsectionMcpDraft } =
      await import("@/src/server/mcp/subsubsectionUpdate/overlaySubsubsectionMcpDraft")

    const overlay = await overlaySubsubsectionMcpDraft({
      projectId: 1,
      extraFieldDefinitions: [],
      currentExtraFields: {},
      patch: JSON.parse(
        JSON.stringify({
          description: "Neuer Text",
          lengthM: 185.4,
          trafficLoadDate: new Date("2026-03-01T00:00:00.000Z"),
        }),
      ),
    })

    expect(overlay).toEqual({
      description: "Neuer Text",
      lengthM: 185.4,
      trafficLoadDate: "2026-03-01",
    })
  })

  test("overlays type and geometry for create drafts", async () => {
    const { overlaySubsubsectionMcpDraft } =
      await import("@/src/server/mcp/subsubsectionUpdate/overlaySubsubsectionMcpDraft")

    const overlay = await overlaySubsubsectionMcpDraft({
      projectId: 1,
      extraFieldDefinitions: [],
      currentExtraFields: {},
      patch: {
        type: "LINE",
        geometry: {
          type: "LineString",
          coordinates: [
            [9.1943, 48.8932],
            [9.2043, 48.8933],
          ],
        },
        description: "Neu",
      },
    })

    expect(overlay).toEqual({
      type: "LINE",
      geometry: {
        type: "LineString",
        coordinates: [
          [9.1943, 48.8932],
          [9.2043, 48.8933],
        ],
      },
      description: "Neu",
    })
  })
})
