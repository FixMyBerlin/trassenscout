import { point } from "@turf/helpers"
import type { GeoJsonProperties, MultiPoint, Point } from "geojson"

/**
 * Converts Point or MultiPoint geometry to an array of GeoJSON Features.
 * Geometry data is expected to be validated at the server boundary.
 */
export const pointToGeoJSON = <T extends GeoJsonProperties>(
  geometry: Point | MultiPoint,
  properties?: T,
) => {
  if (geometry.type === "Point") {
    return [point(geometry.coordinates, properties)]
  }

  if (geometry.type === "MultiPoint") {
    return geometry.coordinates.map((coords) => point(coords, properties))
  }

  return []
}
