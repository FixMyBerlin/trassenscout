import { MultiPointGeometrySchema, PointGeometrySchema } from "@/src/core/utils/geojson-schemas"
import { point } from "@turf/helpers"
import type { GeoJsonProperties, MultiPoint, Point } from "geojson"

/**
 * Converts Point or MultiPoint geometry to an array of GeoJSON Features.
 * Uses Zod schemas to validate geometries before conversion.
 * Returns null for invalid geometries.
 */
export const pointToGeoJSON = <T extends GeoJsonProperties>(
  geometry: Point | MultiPoint,
  properties?: T,
) => {
  if (geometry.type === "Point") {
    const validationResult = PointGeometrySchema.safeParse(geometry)
    if (validationResult.success) {
      return [point(geometry.coordinates, properties)]
    }
    return null
  }

  if (geometry.type === "MultiPoint") {
    const validationResult = MultiPointGeometrySchema.safeParse(geometry)
    if (validationResult.success) {
      // Map all points - Zod validation ensures structure is correct
      return geometry.coordinates.map((coords) => point(coords, properties))
    }
    return null
  }

  return null
}
