import {
  LineStringGeometrySchema,
  MultiLineStringGeometrySchema,
} from "@/src/core/utils/geojson-schemas"
import { lineString } from "@turf/helpers"
import type { GeoJsonProperties, LineString, MultiLineString } from "geojson"

/**
 * Converts LineString or MultiLineString geometry to an array of GeoJSON Features.
 * Uses Zod schemas to validate geometries before conversion.
 * Returns null for invalid geometries.
 */
export const lineStringToGeoJSON = <T extends GeoJsonProperties>(
  geometry: LineString | MultiLineString,
  properties?: T,
) => {
  if (geometry.type === "LineString") {
    const validationResult = LineStringGeometrySchema.safeParse(geometry)
    if (validationResult.success) {
      return [lineString(geometry.coordinates, properties)]
    }
    return null
  }

  if (geometry.type === "MultiLineString") {
    const validationResult = MultiLineStringGeometrySchema.safeParse(geometry)
    if (validationResult.success) {
      // Map all line strings - Zod validation ensures structure is correct
      return geometry.coordinates.map((coords) => lineString(coords, properties))
    }
    return null
  }

  return null
}
