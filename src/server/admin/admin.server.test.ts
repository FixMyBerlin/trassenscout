import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { ALKIS_LAND_ACQUISITION_DEMO_PROJECT_SLUGS } from "@/prisma/seeds/alkisLandAcquisitionDemos"
import { assertAlkisDemoMutationAllowed } from "@/src/server/admin/utils/alkisDemoMutationEnvGate"

vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: {
    admin: vi.fn().mockResolvedValue({ userId: 1, role: "ADMIN" }),
  },
}))

const headers = new Headers()

describe("assertAlkisDemoMutationAllowed", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test("allows development", () => {
    vi.stubEnv("VITE_APP_ENV", "development")
    expect(() => assertAlkisDemoMutationAllowed()).not.toThrow()
  })

  test("allows staging", () => {
    vi.stubEnv("VITE_APP_ENV", "staging")
    expect(() => assertAlkisDemoMutationAllowed()).not.toThrow()
  })

  test("blocks production", () => {
    vi.stubEnv("VITE_APP_ENV", "production")
    expect(() => assertAlkisDemoMutationAllowed()).toThrow(/Produktion/)
  })

  test("blocks unset env", () => {
    vi.stubEnv("VITE_APP_ENV", "")
    expect(() => assertAlkisDemoMutationAllowed()).toThrow(/staging oder development/)
  })
})

describe("ALKIS land acquisition demo mutations", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_APP_ENV", "development")
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test("seed is idempotent and delete removes demo projects", async () => {
    const { deleteAlkisLandAcquisitionDemos, seedAlkisLandAcquisitionDemos } =
      await import("./admin.server")

    const firstSeed = await seedAlkisLandAcquisitionDemos(headers)
    expect(firstSeed.entries).toHaveLength(ALKIS_LAND_ACQUISITION_DEMO_PROJECT_SLUGS.length)
    expect(firstSeed.entries.map((entry) => entry.slug).sort()).toEqual(
      [...ALKIS_LAND_ACQUISITION_DEMO_PROJECT_SLUGS].sort(),
    )

    const secondSeed = await seedAlkisLandAcquisitionDemos(headers)
    expect(secondSeed.entries.every((entry) => entry.project === "updated")).toBe(true)

    const deleteResult = await deleteAlkisLandAcquisitionDemos(headers)
    expect(deleteResult.results).toHaveLength(ALKIS_LAND_ACQUISITION_DEMO_PROJECT_SLUGS.length)
    expect(deleteResult.results.every((result) => result.status === "deleted")).toBe(true)

    const deleteAgain = await deleteAlkisLandAcquisitionDemos(headers)
    expect(deleteAgain.results.every((result) => result.status === "not_found")).toBe(true)
  })
})
