import { describe, expect, test } from "vitest"
import { GeometryTypeEnum } from "@/src/prisma/generated/browser"
import { SupportedGeoJsonGeometrySchema } from "@/src/shared/geometry/geojsonSchemas"
import {
  GeometryWithTypeSchema,
  SubsectionGeometryWithTypeSchema,
  SubsubsectionGeometryWithTypeSchema,
} from "@/src/shared/geometry/geometrySchemas"
import { hasGeometry } from "@/src/shared/geometry/hasGeometry"
import { validateGeometryByType } from "@/src/shared/geometry/validateGeometryByType"

const point = { type: "Point" as const, coordinates: [9.19, 48.89] }
const multiPoint = { type: "MultiPoint" as const, coordinates: [[9.19, 48.89]] }
const lineString = {
  type: "LineString" as const,
  coordinates: [
    [9.19, 48.89],
    [9.2, 48.9],
  ],
}
const polygon = {
  type: "Polygon" as const,
  coordinates: [
    [
      [9.19, 48.89],
      [9.2, 48.9],
      [9.21, 48.91],
      [9.19, 48.89],
    ],
  ],
}

describe("GeoJSON discriminated unions", () => {
  test("accepts each supported geometry type", () => {
    expect(SupportedGeoJsonGeometrySchema.safeParse(point).success).toBe(true)
    expect(SupportedGeoJsonGeometrySchema.safeParse(multiPoint).success).toBe(true)
    expect(SupportedGeoJsonGeometrySchema.safeParse(lineString).success).toBe(true)
    expect(SupportedGeoJsonGeometrySchema.safeParse(polygon).success).toBe(true)
  })

  test("rejects GeometryCollection", () => {
    const result = SupportedGeoJsonGeometrySchema.safeParse({
      type: "GeometryCollection",
      geometries: [point],
    })
    expect(result.success).toBe(false)
  })

  test("rejects mismatched coordinates for geometry type", () => {
    const result = SupportedGeoJsonGeometrySchema.safeParse({
      type: "Point",
      coordinates: [
        [9.19, 48.89],
        [9.2, 48.9],
      ],
    })
    expect(result.success).toBe(false)
  })
})

describe("validateGeometryByType", () => {
  test("accepts point-like geometries for POINT", () => {
    expect(validateGeometryByType(GeometryTypeEnum.POINT, point).success).toBe(true)
    expect(validateGeometryByType(GeometryTypeEnum.POINT, multiPoint).success).toBe(true)
  })

  test("accepts line-like geometries for LINE", () => {
    expect(validateGeometryByType(GeometryTypeEnum.LINE, lineString).success).toBe(true)
  })

  test("accepts polygon-like geometries for POLYGON", () => {
    expect(validateGeometryByType(GeometryTypeEnum.POLYGON, polygon).success).toBe(true)
  })

  test("rejects enum/geometry mismatch", () => {
    expect(validateGeometryByType(GeometryTypeEnum.POINT, lineString).success).toBe(false)
  })
})

describe("GeometryWithTypeSchema", () => {
  test("accepts matching type and geometry", () => {
    const result = GeometryWithTypeSchema.safeParse({
      type: GeometryTypeEnum.POINT,
      geometry: point,
    })
    expect(result.success).toBe(true)
  })

  test("rejects mismatched enum and geometry family", () => {
    const result = GeometryWithTypeSchema.safeParse({
      type: GeometryTypeEnum.POINT,
      geometry: lineString,
    })
    expect(result.success).toBe(false)
  })
})

describe("SubsubsectionGeometryWithTypeSchema", () => {
  test("accepts a Maßnahme without geometry when type and geometry are both null", () => {
    expect(
      SubsubsectionGeometryWithTypeSchema.safeParse({ type: null, geometry: null }).success,
    ).toBe(true)
  })

  test("rejects a geometry without type and a type without geometry", () => {
    expect(
      SubsubsectionGeometryWithTypeSchema.safeParse({ type: null, geometry: point }).success,
    ).toBe(false)
    expect(
      SubsubsectionGeometryWithTypeSchema.safeParse({
        type: GeometryTypeEnum.POINT,
        geometry: null,
      }).success,
    ).toBe(false)
  })

  test("still checks that type and geometry match", () => {
    expect(
      SubsubsectionGeometryWithTypeSchema.safeParse({
        type: GeometryTypeEnum.POINT,
        geometry: lineString,
      }).success,
    ).toBe(false)
  })
})

describe("hasGeometry", () => {
  test("keeps entries with geometry and drops Maßnahmen without", () => {
    const entries = [
      { slug: "a", type: GeometryTypeEnum.POINT, geometry: point },
      { slug: "b", type: null, geometry: null },
    ]

    expect(entries.filter(hasGeometry).map((entry) => entry.slug)).toEqual(["a"])
  })
})

describe("SubsectionGeometryWithTypeSchema", () => {
  test("rejects POINT for subsections", () => {
    const result = SubsectionGeometryWithTypeSchema.safeParse({
      type: GeometryTypeEnum.POINT,
      geometry: point,
    })
    expect(result.success).toBe(false)
  })

  test("accepts LINE with line geometry", () => {
    const result = SubsectionGeometryWithTypeSchema.safeParse({
      type: GeometryTypeEnum.LINE,
      geometry: lineString,
    })
    expect(result.success).toBe(true)
  })
})
