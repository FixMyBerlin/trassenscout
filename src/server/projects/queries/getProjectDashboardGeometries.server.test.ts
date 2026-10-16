import type { Position } from "geojson"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { getProjectDashboardGeometries } from "./getProjectDashboardGeometries.server"

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  session: vi.fn(),
}))

vi.mock("@/src/server/db.server", () => ({
  default: { project: { findMany: (...args: unknown[]) => mocks.findMany(...args) } },
}))

vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: { session: (...args: unknown[]) => mocks.session(...args) },
}))

let nextSubsectionId = 1

const line = (coordinates: Position[]) => ({
  id: nextSubsectionId++,
  updatedAt: new Date(0),
  type: "LINE",
  geometry: { type: "LineString", coordinates },
})

const square = (x: number) => ({
  id: nextSubsectionId++,
  updatedAt: new Date(0),
  type: "POLYGON",
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [x, 52],
        [x + 0.1, 52],
        [x + 0.1, 52.1],
        [x, 52.1],
        [x, 52],
      ],
    ],
  },
})

const project = (slug: string, partOf: string | null, subsections: unknown[]) => ({
  slug,
  partOf,
  subsections,
})

describe("getProjectDashboardGeometries", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.session.mockResolvedValue({ userId: 1 })
  })

  test("labels touching sections of one group once, across spellings", async () => {
    mocks.findMany.mockResolvedValue([
      project("frm9-ra1", "FRM9", [
        line([
          [13, 52],
          [13.1, 52],
        ]),
      ]),
      project("frm9-ra2", " frm 9 ", [
        line([
          [13.1, 52],
          [13.2, 52],
        ]),
      ]),
    ])

    const { partOfLabels } = await getProjectDashboardGeometries(new Headers())

    expect(partOfLabels.features).toHaveLength(1)
    expect(partOfLabels.features[0]?.properties.label).toBe("FRM9")
  })

  test("treats a small gap between sections as one route", async () => {
    mocks.findMany.mockResolvedValue([
      project("frm9-ra1", "FRM9", [
        line([
          [13, 52],
          [13.1, 52],
        ]),
      ]),
      project("frm9-ra2", "FRM9", [
        line([
          [13.105, 52],
          [13.2, 52],
        ]),
      ]),
    ])

    const { partOfLabels } = await getProjectDashboardGeometries(new Headers())

    expect(partOfLabels.features).toHaveLength(1)
  })

  test("labels each separate piece and skips projects without a value", async () => {
    mocks.findMany.mockResolvedValue([
      project("frm9-ra1", "FRM9", [
        line([
          [13, 52],
          [13.1, 52],
        ]),
      ]),
      project("frm9-ra3", "FRM9", [
        line([
          [14, 52],
          [14.1, 52],
        ]),
      ]),
      project("rs8", null, [
        line([
          [15, 52],
          [15.1, 52],
        ]),
      ]),
      project("rs23", "  ", [
        line([
          [16, 52],
          [16.1, 52],
        ]),
      ]),
    ])

    const { partOfLabels } = await getProjectDashboardGeometries(new Headers())

    expect(partOfLabels.features.map((feature) => feature.properties.label)).toEqual([
      "FRM9",
      "FRM9",
    ])
  })

  test("labels touching areas of one group once", async () => {
    mocks.findMany.mockResolvedValue([
      project("ohv-a", "OHV", [square(13)]),
      project("ohv-b", "OHV", [square(13.1)]),
    ])

    const { partOfLabels, polygons } = await getProjectDashboardGeometries(new Headers())

    expect(polygons.features).toHaveLength(2)
    expect(partOfLabels.features).toHaveLength(1)
  })
})
