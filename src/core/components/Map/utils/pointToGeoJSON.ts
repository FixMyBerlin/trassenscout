import { PointGeometrySchema } from "@/src/core/utils/geojson-schemas"
import { point } from "@turf/helpers"
import type { GeoJsonProperties, Point } from "geojson"

/**
 * Converts Point geometry to GeoJSON Point.
 * Uses Zod schema to validate geometry before conversion.
 * Returns null for invalid geometries.
 */
export const pointToGeoJSON = <T extends GeoJsonProperties>(geometry: Point, properties?: T) => {
  const validationResult = PointGeometrySchema.safeParse(geometry)
  if (validationResult.success) {
    return point(geometry.coordinates, properties)
  }
  return null
}
