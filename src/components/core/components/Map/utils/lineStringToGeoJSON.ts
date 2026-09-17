import { lineString } from "@turf/helpers"
import type { GeoJsonProperties, LineString, MultiLineString } from "geojson"

/**
 * Converts LineString or MultiLineString geometry to an array of GeoJSON Features.
 *
 * Pages gate geometry with `isRenderableGeometry` before it gets here. This is the backstop:
 * anything Turf still rejects yields no features rather than throwing and blanking the map.
 */
export const lineStringToGeoJSON = <T extends GeoJsonProperties>(
  geometry: LineString | MultiLineString,
  properties?: T,
) => {
  try {
    if (geometry.type === "LineString") {
      return [lineString(geometry.coordinates, properties)]
    }

    if (geometry.type === "MultiLineString") {
      return geometry.coordinates.map((coords) => lineString(coords, properties))
    }
  } catch {
    // Unrenderable stored data — skip it instead of failing the map.
  }

  return []
}
