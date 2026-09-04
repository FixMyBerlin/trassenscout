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

describe("resolveSubsubsectionRelationSlugs", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("skip mode ignores unknown slugs like import", async () => {
    const { resolveSubsubsectionRelationSlugs } =
      await import("@/src/server/subsubsections/resolveSubsubsectionRelationSlugs.server")
    mockDb.qualityLevel.findFirst.mockResolvedValue(null)

    await expect(
      resolveSubsubsectionRelationSlugs({
        projectId: 1,
        slugs: { qualityLevelSlug: "missing" },
        missing: "skip",
      }),
    ).resolves.toEqual({
      qualityLevelId: undefined,
      subsubsectionStatusId: undefined,
      subsubsectionInfraId: undefined,
      subsubsectionTaskId: undefined,
    })
  })

  test("error mode throws on unknown slug", async () => {
    const { resolveSubsubsectionRelationSlugs } =
      await import("@/src/server/subsubsections/resolveSubsubsectionRelationSlugs.server")
    mockDb.qualityLevel.findFirst.mockResolvedValue(null)

    await expect(
      resolveSubsubsectionRelationSlugs({
        projectId: 1,
        slugs: { qualityLevelSlug: "missing" },
        missing: "error",
      }),
    ).rejects.toThrow('Unknown qualityLevelSlug: "missing"')
  })

  test("infrastructure type slugs are deduped", async () => {
    const { resolveSubsubsectionInfrastructureTypeSlugs } =
      await import("@/src/server/subsubsections/resolveSubsubsectionRelationSlugs.server")
    mockDb.subsubsectionInfrastructureType.findFirst.mockResolvedValue({ id: 2 })

    const ids = await resolveSubsubsectionInfrastructureTypeSlugs({
      projectId: 1,
      slugs: ["new", "new"],
      missing: "error",
    })
    expect(ids).toEqual([2])
    expect(mockDb.subsubsectionInfrastructureType.findFirst).toHaveBeenCalledTimes(1)
  })
})
