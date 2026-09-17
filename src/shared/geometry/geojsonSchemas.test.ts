import { polygon } from "@turf/helpers"
import { describe, expect, test } from "vitest"
import {
  MultiPolygonGeometrySchema,
  PolygonGeometrySchema,
} from "@/src/shared/geometry/geojsonSchemas"

const turfAccepts = (coordinates: number[][][]) => {
  try {
    polygon(coordinates)
    return true
  } catch {
    return false
  }
}

const closedRing = [
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
const tooShortRing = [
  [13.4, 52.5],
  [13.5, 52.5],
  [13.4, 52.5],
]

/**
 * The map helpers hand geometry straight to Turf and document that it was "validated at the server
 * boundary". These tests pin that promise: whatever Turf rejects, the schema has to reject too.
 */
describe("PolygonGeometrySchema", () => {
  test.each([
    ["a closed ring", closedRing, true],
    ["an unclosed ring", unclosedRing, false],
    ["a ring with fewer than 4 positions", tooShortRing, false],
  ])("accepts %s: %j -> %s", (_name, ring, expected) => {
    const coordinates = [ring]

    expect(PolygonGeometrySchema.safeParse({ type: "Polygon", coordinates }).success).toBe(expected)
    // The schema is only useful if it agrees with the library that consumes the result.
    expect(turfAccepts(coordinates)).toBe(expected)
  })

  test("reports why a ring was rejected", () => {
    const result = PolygonGeometrySchema.safeParse({
      type: "Polygon",
      coordinates: [unclosedRing],
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toContain("geschlossen")
  })
})

describe("MultiPolygonGeometrySchema", () => {
  test("applies the same ring rules one level deeper", () => {
    expect(
      MultiPolygonGeometrySchema.safeParse({
        type: "MultiPolygon",
        coordinates: [[closedRing]],
      }).success,
    ).toBe(true)
    expect(
      MultiPolygonGeometrySchema.safeParse({
        type: "MultiPolygon",
        coordinates: [[closedRing], [unclosedRing]],
      }).success,
    ).toBe(false)
  })
})
