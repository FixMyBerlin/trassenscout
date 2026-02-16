import { polygon } from "@turf/helpers"
import type { GeoJsonProperties, MultiPolygon, Polygon } from "geojson"

/**
 * Converts Polygon or MultiPolygon geometry to an array of GeoJSON Features.
 * Geometry data is expected to be validated at the server boundary.
 */
export const polygonToGeoJSON = <T extends GeoJsonProperties>(
  geometry: Polygon | MultiPolygon,
  properties?: T,
) => {
  if (geometry.type === "Polygon") {
    return [polygon(geometry.coordinates, properties)]
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.map((coords) => polygon(coords, properties))
  }

  return []
}
