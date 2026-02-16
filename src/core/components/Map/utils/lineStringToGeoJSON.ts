import { lineString } from "@turf/helpers"
import type { GeoJsonProperties, LineString, MultiLineString } from "geojson"

/**
 * Converts LineString or MultiLineString geometry to an array of GeoJSON Features.
 * Geometry data is expected to be validated at the server boundary.
 */
export const lineStringToGeoJSON = <T extends GeoJsonProperties>(
  geometry: LineString | MultiLineString,
  properties?: T,
) => {
  if (geometry.type === "LineString") {
    return [lineString(geometry.coordinates, properties)]
  }

  if (geometry.type === "MultiLineString") {
    return geometry.coordinates.map((coords) => lineString(coords, properties))
  }

  return []
}
