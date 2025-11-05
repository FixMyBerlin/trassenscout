import { MultiPolygonGeometrySchema, PolygonGeometrySchema } from "@/src/core/utils/geojson-schemas"
import { polygon } from "@turf/helpers"
import type { GeoJsonProperties, MultiPolygon, Polygon } from "geojson"

/**
 * Converts Polygon or MultiPolygon geometry to an array of GeoJSON Features.
 * Uses Zod schemas to validate geometries before conversion.
 * Returns null for invalid geometries.
 */
export const polygonToGeoJSON = <T extends GeoJsonProperties>(
  geometry: Polygon | MultiPolygon,
  properties?: T,
) => {
  if (geometry.type === "Polygon") {
    const validationResult = PolygonGeometrySchema.safeParse(geometry)
    if (validationResult.success) {
      return [polygon(geometry.coordinates, properties)]
    }
    return null
  }

  if (geometry.type === "MultiPolygon") {
    const validationResult = MultiPolygonGeometrySchema.safeParse(geometry)
    if (validationResult.success) {
      // Map all polygons - Zod validation ensures structure is correct
      return geometry.coordinates.map((coords) => polygon(coords, properties))
    }
    return null
  }

  return null
}
