import { describe, expect, test } from "vitest"
import {
  SubsubsectionBaseSchema,
  SubsubsectionSchema,
  subsubsectionFormDefaultValues,
} from "@/src/shared/subsubsections/schemas"

const GeometryField = SubsubsectionBaseSchema.shape.geometry

describe("SubsubsectionBaseSchema geometry", () => {
  test("asks for a drawing or the checkbox when nothing is drawn", () => {
    const result = GeometryField.safeParse(undefined)

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toContain("Maßnahme ohne Geometrie")
  })

  test("accepts null for a Maßnahme ohne Geometrie and a drawn geometry", () => {
    expect(GeometryField.safeParse(null).success).toBe(true)
    expect(GeometryField.safeParse({ type: "Point", coordinates: [13.4, 52.5] }).success).toBe(true)
  })
})

describe("SubsubsectionSchema (server validation of create and update)", () => {
  const point = { type: "Point" as const, coordinates: [13.4, 52.5] }
  const payload = (overrides: Record<string, unknown>) => ({
    ...subsubsectionFormDefaultValues,
    slug: "rf-1",
    subsectionId: 10,
    location: null,
    trafficLoadDate: null,
    estimatedCompletionDate: null,
    ...overrides,
  })

  test("saves a Maßnahme ohne Geometrie without a validation block", () => {
    expect(SubsubsectionSchema.safeParse(payload({ type: null, geometry: null })).success).toBe(
      true,
    )
  })

  test("still saves a drawn geometry with its matching type", () => {
    expect(SubsubsectionSchema.safeParse(payload({ type: "POINT", geometry: point })).success).toBe(
      true,
    )
  })

  test("rejects half-empty pairs and a missing drawing", () => {
    expect(SubsubsectionSchema.safeParse(payload({ type: "LINE", geometry: null })).success).toBe(
      false,
    )
    expect(SubsubsectionSchema.safeParse(payload({ type: null, geometry: point })).success).toBe(
      false,
    )
    expect(SubsubsectionSchema.safeParse(payload({ geometry: undefined })).success).toBe(false)
  })
})
