import { feature } from "@turf/helpers"
import { truncate } from "@turf/turf"
import type { Geometry } from "geojson"

/**
 * Rounds coordinates in a geometry to a reasonable precision (6 decimal places ≈ 10cm accuracy)
 * Uses Turf.js truncate function which properly handles all geometry types
 * This prevents Terra Draw validation errors and ensures consistent precision from API/tRPC
 */
export const roundGeometryCoordinates = (geometry: Geometry): Geometry => {
  // Turf truncate works on Features, so wrap geometry in a Feature
  const featureWithGeometry = feature(geometry)
  const truncated = truncate(featureWithGeometry, { precision: 6 })
  // Extract geometry back from the feature
  return truncated.geometry
}
