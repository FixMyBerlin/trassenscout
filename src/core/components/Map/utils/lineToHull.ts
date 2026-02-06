import { convex } from "@turf/convex"
import { featureCollection } from "@turf/helpers"
import { union } from "@turf/union"
import type { LineString, MultiLineString } from "geojson"
import { lineStringToGeoJSON } from "./lineStringToGeoJSON"

/**
 * Converts LineString or MultiLineString geometry to a hull polygon geometry.
 * For MultiLineString, creates hulls for each LineString and merges them.
 * Returns Polygon or MultiPolygon geometry.
 */
export const lineToHullGeometry = (geometry: LineString | MultiLineString) => {
  // 1. Convert line(s) to features - handles both LineString and MultiLineString
  const lineFeatures = lineStringToGeoJSON(geometry, {})

  // 2. Create hull for each LineString (MultiLineString returns multiple features)
  const hulls = lineFeatures
    .map((lineFeature) => convex(lineFeature))
    .filter((hull): hull is NonNullable<typeof hull> => hull !== null)

  if (hulls.length === 0) {
    throw new Error("Failed to create hull from line geometry")
  }

  // 3. Merge all hulls into a single polygon if multiple
  const mergedHull = hulls.length > 1 ? union(featureCollection(hulls)) : hulls[0]
  if (!mergedHull || !mergedHull.geometry) {
    throw new Error("Failed to create hull from line geometry")
  }

  return mergedHull.geometry
}
