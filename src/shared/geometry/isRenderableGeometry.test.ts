import { featureCollection } from "@turf/helpers"
import { bbox } from "@turf/turf"
import type { Feature } from "geojson"
import { describe, expect, test } from "vitest"
import { geometryToFeatures } from "@/src/components/core/components/Map/utils/geometryToFeatures"
import { brokenGeometryItems } from "@/src/shared/geometry/brokenGeometryItems"
import { isRenderableGeometry } from "@/src/shared/geometry/isRenderableGeometry"

const line = [
  [13.4, 52.5],
  [13.5, 52.6],
]
const ring = [
  [13.4, 52.5],
  [13.5, 52.5],
  [13.5, 52.6],
  [13.4, 52.5],
]
const unclosedRing = [
  [13.4, 52.5],
  [13.5, 52.5],
  [13.5, 52.6],
  [13.4, 52.6],
]

/**
 * This is the single gate every page uses before handing geometry to a map. It has to reject
 * exactly what Turf and MapLibre would throw on — no more, no less.
 */
describe("isRenderableGeometry", () => {
  test.each([
    ["unclosed polygon ring", { type: "Polygon", coordinates: [unclosedRing] }],
    [
      "polygon ring with too few points",
      {
        type: "Polygon",
        coordinates: [
          [
            [13.4, 52.5],
            [13.5, 52.5],
            [13.4, 52.5],
          ],
        ],
      },
    ],
    [
      "one broken ring inside a MultiPolygon",
      { type: "MultiPolygon", coordinates: [[ring], [unclosedRing]] },
    ],
    ["line with a single point", { type: "LineString", coordinates: [[13.4, 52.5]] }],
    [
      "one short part inside a MultiLineString",
      { type: "MultiLineString", coordinates: [line, [[13.4, 52.5]]] },
    ],
    [
      "latitude outside WGS84",
      {
        type: "LineString",
        coordinates: [
          [13.4, 552.5],
          [13.5, 52.6],
        ],
      },
    ],
    [
      "longitude outside WGS84",
      {
        type: "LineString",
        coordinates: [
          [1013.4, 52.5],
          [13.5, 52.6],
        ],
      },
    ],
    [
      "non-numeric coordinate",
      {
        type: "LineString",
        coordinates: [
          [13.4, "52.5"],
          [13.5, 52.6],
        ],
      },
    ],
    [
      "coordinate with three values",
      {
        type: "LineString",
        coordinates: [
          [13.4, 52.5, 100],
          [13.5, 52.6],
        ],
      },
    ],
    ["polygon without rings", { type: "Polygon", coordinates: [] }],
    ["multi-line without parts", { type: "MultiLineString", coordinates: [] }],
    ["multi-polygon without polygons", { type: "MultiPolygon", coordinates: [] }],
    ["multi-polygon with an empty polygon", { type: "MultiPolygon", coordinates: [[]] }],
    ["missing coordinates", { type: "Polygon" }],
    ["missing type", { coordinates: line }],
    ["null", null],
    ["an unsupported family", { type: "GeometryCollection", geometries: [] }],
  ])("rejects %s", (_name, geometry) => {
    expect(isRenderableGeometry(geometry)).toBe(false)
  })

  test.each([
    ["a point", { type: "Point", coordinates: [13.4, 52.5] }],
    ["a line", { type: "LineString", coordinates: line }],
    ["a multi-line", { type: "MultiLineString", coordinates: [line] }],
    ["a polygon", { type: "Polygon", coordinates: [ring] }],
    ["a multi-polygon", { type: "MultiPolygon", coordinates: [[ring]] }],
  ])("accepts %s, and it survives the map helpers", (_name, geometry) => {
    expect(isRenderableGeometry(geometry)).toBe(true)

    // The promise the map components rely on: anything this gate accepts can be drawn.
    const features = geometryToFeatures(geometry as never) as Feature[]
    expect(features.length).toBeGreaterThan(0)
    expect(bbox(featureCollection(features)).every(Number.isFinite)).toBe(true)
  })
})

/**
 * What pages actually call. Beyond a renderable geometry it also requires the geometry to match
 * the entry's `type` column, so a mismatch is named instead of silently drawing nothing.
 */
describe("brokenGeometryItems", () => {
  const item = (type: string, geometry: unknown) => ({ id: 1, slug: "poly-1", type, geometry })

  test("keeps entries whose geometry matches their type", () => {
    expect(brokenGeometryItems([item("LINE", { type: "LineString", coordinates: line })])).toEqual(
      [],
    )
    expect(
      brokenGeometryItems([item("POLYGON", { type: "Polygon", coordinates: [ring] })]),
    ).toEqual([])
  })

  test("names an entry whose geometry cannot be drawn", () => {
    const broken = item("POLYGON", { type: "Polygon", coordinates: [unclosedRing] })

    expect(brokenGeometryItems([broken])).toHaveLength(1)
  })

  test("names an entry whose geometry disagrees with its type", () => {
    const mismatch = item("LINE", { type: "Point", coordinates: [13.4, 52.5] })

    expect(isRenderableGeometry(mismatch.geometry)).toBe(true)
    expect(brokenGeometryItems([mismatch])).toHaveLength(1)
  })

  test("falls back to the geometry alone when there is no type column", () => {
    const withoutType = {
      id: 1,
      slug: "area-1",
      geometry: { type: "Polygon", coordinates: [ring] },
    }

    expect(brokenGeometryItems([withoutType])).toEqual([])
  })
})
