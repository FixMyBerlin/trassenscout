import { z } from "zod"

/**
 * Shared refinement function for geometry type validation
 * Validates that geometry type matches enum type
 * Used for both subsections and subsubsections
 */
export const geometryTypeValidationRefine = <T extends z.ZodTypeAny>(schema: T) =>
  schema.refine(
    (data: any) => {
      // Validate that geometry type matches enum type
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
    },
    {
      message:
        "Geometry type must match enum type (POINT→Point/MultiPoint, LINE→LineString/MultiLineString, POLYGON→Polygon/MultiPolygon)",
    },
  )
