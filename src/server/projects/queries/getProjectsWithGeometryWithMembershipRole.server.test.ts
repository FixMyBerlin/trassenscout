import { beforeEach, describe, expect, test, vi } from "vitest"
import { UserRoleEnum } from "@/src/prisma/generated/browser"

const mockFindMany = vi.fn()
const mockSession = vi.fn()

vi.mock("@/src/server/db.server", () => ({
  default: { project: { findMany: mockFindMany } },
}))

vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: { session: mockSession },
}))

const headers = new Headers()

const project = (subsections: { geometry: unknown; type: string; labelPos: null }[]) => ({
  id: 1,
  slug: "rs23",
  subTitle: "Radschnellweg 23",
  showLogEntries: false,
  _count: { subsections: subsections.length },
  subsections,
  memberships: [{ role: "VIEWER" }],
})

const lineGeometry = {
  type: "LineString",
  coordinates: [
    [13.4, 52.5],
    [13.5, 52.6],
  ],
}

describe("getProjectsWithGeometryWithMembershipRole", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession.mockResolvedValue({ role: UserRoleEnum.USER, userId: 99 })
  })

  test("returns the label position of the first subsection", async () => {
    mockFindMany.mockResolvedValue([
      project([{ geometry: lineGeometry, type: "LINE", labelPos: null }]),
    ])

    const { getProjectsWithGeometryWithMembershipRole } =
      await import("./getProjectsWithGeometryWithMembershipRole.server")
    const result = await getProjectsWithGeometryWithMembershipRole(headers)

    const [longitude, latitude] = result[0]?.previewPoint ?? []
    expect(longitude).toBeCloseTo(13.45, 3)
    expect(latitude).toBeCloseTo(52.55, 3)
    expect(result[0]?.subsectionCount).toBe(1)
  })

  // Regression: a malformed geometry used to throw out of the whole query, which failed the
  // dashboard with "Ein Fehler ist aufgetreten" instead of dropping one project's preview point.
  test.each([
    [
      "geometry that matches no allowed schema",
      { geometry: { type: "LineString", coordinates: [[13.4]] }, type: "LINE" },
    ],
    ["a subsection type that has no geometry mapping", { geometry: lineGeometry, type: "POINT" }],
  ])("keeps the project and returns no preview point for %s", async (_name, subsection) => {
    mockFindMany.mockResolvedValue([project([{ ...subsection, labelPos: null }])])

    const { getProjectsWithGeometryWithMembershipRole } =
      await import("./getProjectsWithGeometryWithMembershipRole.server")
    const result = await getProjectsWithGeometryWithMembershipRole(headers)

    expect(result).toHaveLength(1)
    expect(result[0]?.previewPoint).toBeNull()
  })

  test("returns no preview point when the project has no subsections", async () => {
    mockFindMany.mockResolvedValue([project([])])

    const { getProjectsWithGeometryWithMembershipRole } =
      await import("./getProjectsWithGeometryWithMembershipRole.server")
    const result = await getProjectsWithGeometryWithMembershipRole(headers)

    expect(result[0]?.previewPoint).toBeNull()
  })

  test("scopes the query to own memberships", async () => {
    mockFindMany.mockResolvedValue([])

    const { getProjectsWithGeometryWithMembershipRole } =
      await import("./getProjectsWithGeometryWithMembershipRole.server")
    await getProjectsWithGeometryWithMembershipRole(headers)

    expect(mockFindMany.mock.calls[0]?.[0].where).toEqual({
      memberships: { some: { userId: 99 } },
    })
  })

  // "Meine Projekte" means the projects you belong to, for admins too — otherwise the dashboard
  // map fills up with every project in the system.
  test("scopes the query for admins as well", async () => {
    mockSession.mockResolvedValue({ role: UserRoleEnum.ADMIN, userId: 1 })
    mockFindMany.mockResolvedValue([])

    const { getProjectsWithGeometryWithMembershipRole } =
      await import("./getProjectsWithGeometryWithMembershipRole.server")
    await getProjectsWithGeometryWithMembershipRole(headers)

    expect(mockFindMany.mock.calls[0]?.[0].where).toEqual({
      memberships: { some: { userId: 1 } },
    })
  })
})
