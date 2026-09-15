import { point } from "@turf/helpers"
import type { GeoJsonProperties, MultiPoint, Point } from "geojson"

/**
 * Converts Point or MultiPoint geometry to an array of GeoJSON Features.
 *
 * Pages gate geometry with `isRenderableGeometry` before it gets here. This is the backstop:
 * anything Turf still rejects yields no features rather than throwing and blanking the map.
 */
export const pointToGeoJSON = <T extends GeoJsonProperties>(
  geometry: Point | MultiPoint,
  properties?: T,
) => {
  try {
    if (geometry.type === "Point") {
      return [point(geometry.coordinates, properties)]
    }

    if (geometry.type === "MultiPoint") {
      return geometry.coordinates.map((coords) => point(coords, properties))
    }
  } catch {
    // Unrenderable stored data — skip it instead of failing the map.
  }

  return []
}
