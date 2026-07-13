import { buffer } from "@turf/buffer"
import { featureCollection } from "@turf/helpers"
import { union } from "@turf/union"
import type { LineString, MultiLineString, MultiPolygon, Polygon } from "geojson"
import { lineStringToGeoJSON } from "./lineStringToGeoJSON"

/**
 * Converts LineString or MultiLineString geometry to a hull polygon geometry.
 * For MultiLineString, creates hulls for each LineString and merges them.
 * Uses buffer() to create a uniform-width polygon around the line.
 * Returns Polygon or MultiPolygon geometry.
 */
export const lineToHullGeometry = (geometry: LineString | MultiLineString) => {
  // 1. Convert line(s) to features - handles both LineString and MultiLineString
  const lineFeatures = lineStringToGeoJSON(geometry, {})

  // 2. Create hull for each LineString (MultiLineString returns multiple features)
  // Buffer radius: 10 meters (small buffer for visualization)
  const hullResults = lineFeatures.map((lineFeature) => {
    const hull = buffer(lineFeature, 20, { units: "meters" })
    return { lineFeature, hull }
  })

  const hulls = hullResults.map((r) => r.hull).filter(Boolean)

  if (hulls.length === 0) {
    throw new Error("Failed to create hull from line geometry")
  }

  // 3. Merge all hulls into a single polygon if multiple
  const mergedHull = hulls.length > 1 ? union(featureCollection(hulls)) : hulls[0]
  if (!mergedHull || !mergedHull.geometry) {
    throw new Error("Failed to create hull from line geometry")
  }

  return mergedHull.geometry as Polygon | MultiPolygon
}
