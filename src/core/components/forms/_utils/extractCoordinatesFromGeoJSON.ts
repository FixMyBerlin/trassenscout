import { FeatureCollectionSchema, FeatureSchema } from "@/src/server/subsections/schema"

/**
 * Extracts coordinates from GeoJSON input (Feature, FeatureCollection, or Geometry)
 * Returns coordinates in the format expected by the form:
 * - Point: [number, number]
 * - LineString: [[number, number], ...]
 */
export const extractCoordinatesFromGeoJSON = (text: string) => {
  // Only JSON parsing can throw
  let parsed: unknown
  try {
    parsed = JSON.parse(text) as unknown
  } catch {
    return null
  }

  // Shared geometry processing: accept only Point and LineString
  const processGeometry = (geometry: any) => {
    if (!geometry) return null
    const t = geometry.type as string
    if (t === "Point" || t === "LineString") {
      return { coordinates: geometry.coordinates, geometryType: t }
    }
    return null
  }

  // Handle FeatureCollection - use first feature's geometry
  const featureCollectionResult = FeatureCollectionSchema.safeParse(parsed)
  if (featureCollectionResult.success && featureCollectionResult.data.features.length > 0) {
    const firstFeature = featureCollectionResult.data.features[0]
    return processGeometry(firstFeature?.geometry)
  }

  // Handle Feature - extract geometry
  const featureResult = FeatureSchema.safeParse(parsed)
  if (featureResult.success && featureResult.data.geometry) {
    return processGeometry(featureResult.data.geometry)
  }

  return null
}
