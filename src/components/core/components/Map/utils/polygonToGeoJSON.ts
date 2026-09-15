import { polygon } from "@turf/helpers"
import type { GeoJsonProperties, MultiPolygon, Polygon } from "geojson"

/**
 * Converts Polygon or MultiPolygon geometry to an array of GeoJSON Features.
 *
 * Pages gate geometry with `isRenderableGeometry` before it gets here. This is the backstop:
 * anything Turf still rejects yields no features rather than throwing and blanking the map.
 */
export const polygonToGeoJSON = <T extends GeoJsonProperties>(
  geometry: Polygon | MultiPolygon,
  properties?: T,
) => {
  try {
    if (geometry.type === "Polygon") {
      return [polygon(geometry.coordinates, properties)]
    }

    if (geometry.type === "MultiPolygon") {
      return geometry.coordinates.map((coords) => polygon(coords, properties))
    }
  } catch {
    // Unrenderable stored data — skip it instead of failing the map.
  }

  return []
}
