import type { Geometry } from "geojson"
import { z } from "zod"

type GeometryTypeEnum = "POINT" | "LINE" | "POLYGON"

type GeometryData = {
  type: GeometryTypeEnum
  geometry: Geometry
}

/**
 * Validates that geometry type matches enum type
 */
const validateGeometryTypeMatchesEnum = (data: GeometryData) => {
  if (
    data.type === "POINT" &&
    data.geometry.type !== "Point" &&
    data.geometry.type !== "MultiPoint"
  )
    return false
  if (
    data.type === "LINE" &&
    data.geometry.type !== "LineString" &&
    data.geometry.type !== "MultiLineString"
  )
    return false
  if (
    data.type === "POLYGON" &&
    data.geometry.type !== "Polygon" &&
    data.geometry.type !== "MultiPolygon"
  )
    return false
  return true
}

/**
 * Validates that enum type is in the allowed list
 */
const validateAllowedTypes = (
  data: Pick<GeometryData, "type">,
  allowedTypes: GeometryTypeEnum[],
) => {
  return allowedTypes.includes(data.type)
}

/**
 * Shared refinement function for geometry type validation
 * Validates that geometry type matches enum type
 * Used for both subsections and subsubsections
 */
export const geometryTypeValidationRefine = <T extends z.ZodTypeAny>(schema: T) =>
  schema.refine((data: GeometryData) => validateGeometryTypeMatchesEnum(data), {
    message:
      "Geometry type must match enum type (POINT→Point/MultiPoint, LINE→LineString/MultiLineString, POLYGON→Polygon/MultiPolygon)",
  })

/**
 * Validation refinement for subsections
 * Only allows LINE and POLYGON types (not POINT)
 */
export const subsectionGeometryTypeValidationRefine = <T extends z.ZodTypeAny>(schema: T) =>
  schema
    .refine((data: GeometryData) => validateAllowedTypes(data, ["LINE", "POLYGON"]), {
      message: "Subsection type must be LINE or POLYGON (Point is not allowed)",
    })
    .refine((data: GeometryData) => validateGeometryTypeMatchesEnum(data), {
      message:
        "Geometry type must match enum type (LINE→LineString/MultiLineString, POLYGON→Polygon/MultiPolygon)",
    })

/**
 * Validation refinement for subsubsections
 * Allows POINT, LINE, and POLYGON types
 */
export const subsubsectionGeometryTypeValidationRefine = <T extends z.ZodTypeAny>(schema: T) =>
  schema
    .refine((data: GeometryData) => validateAllowedTypes(data, ["POINT", "LINE", "POLYGON"]), {
      message: "Subsubsection type must be POINT, LINE, or POLYGON",
    })
    .refine((data: GeometryData) => validateGeometryTypeMatchesEnum(data), {
      message:
        "Geometry type must match enum type (POINT→Point/MultiPoint, LINE→LineString/MultiLineString, POLYGON→Polygon/MultiPolygon)",
    })
