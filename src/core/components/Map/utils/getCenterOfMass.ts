import { lineString, multiLineString, multiPolygon, polygon } from "@turf/helpers"
import { centerOfMass } from "@turf/turf"
import type { Feature, Geometry } from "geojson"

type Dot = [number, number]

/**
 * Calculate the center of mass for a GeoJSON geometry.
 * For points, returns the coordinates directly.
 * For lines and polygons, uses turf.centerOfMass.
 */
export const getCenterOfMass = (geometry: Geometry): Dot => {
  if (geometry.type === "Point") {
    return geometry.coordinates as Dot
  }

  // Create a feature from the geometry for turf operations
  let feature: Feature
  if (geometry.type === "LineString") {
    feature = lineString(geometry.coordinates)
  } else if (geometry.type === "MultiLineString") {
    feature = multiLineString(geometry.coordinates)
  } else if (geometry.type === "Polygon") {
    feature = polygon(geometry.coordinates)
  } else if (geometry.type === "MultiPolygon") {
    feature = multiPolygon(geometry.coordinates)
  } else {
    // Fallback for unknown geometry types
    return [0, 0] as Dot
  }

  const center = centerOfMass(feature)
  return center.geometry.coordinates as Dot
}
