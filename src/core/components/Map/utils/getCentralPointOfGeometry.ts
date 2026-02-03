import { multiPolygon, polygon } from "@turf/helpers"
import { centerOfMass } from "@turf/turf"
import type { Geometry } from "geojson"
import { midPoint } from "./midPoint"

type Dot = [number, number]

/**
 * Calculate the central point for a GeoJSON geometry.
 * For points, returns the coordinates directly.
 * For lines and multi-lines, uses turf.midpoint. turf.centerOfMass is not used here because the returned point might not be on the line(s) of the geometry.
 * For polygons, uses turf.centerOfMass.
 */
export const getCentralPointOfGeometry = (geometry: Geometry): Dot => {
  if (geometry.type === "Point") {
    return geometry.coordinates as Dot
  }
  if (geometry.type === "LineString") {
    return midPoint(geometry.coordinates) as Dot
  }
  if (geometry.type === "MultiLineString") {
    const firstLine = geometry.coordinates[0]
    if (firstLine?.length) {
      return midPoint(firstLine) as Dot
    }
  }
  if (geometry.type === "Polygon") {
    return centerOfMass(polygon(geometry.coordinates)).geometry.coordinates as Dot
  }
  if (geometry.type === "MultiPolygon") {
    return centerOfMass(multiPolygon(geometry.coordinates)).geometry.coordinates as Dot
  }

  // Fallback for unknown geometry types
  return [0, 0] as Dot
}
