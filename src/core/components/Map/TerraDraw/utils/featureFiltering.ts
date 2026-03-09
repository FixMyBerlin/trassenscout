import type { GeoJSONStoreFeatures } from "terra-draw"

// Helper to determine geometry type family
export const getGeometryFamily = (type: string | undefined | null) => {
  if (type === "Point" || type === "MultiPoint") return "point" as const
  if (type === "LineString" || type === "MultiLineString") return "line" as const
  if (type === "Polygon" || type === "MultiPolygon") return "polygon" as const
  return null
}

// Cleanup function: filter features to match first feature's type family
// This prevents mixed geometries from being saved (enforced by button disabling during drawing)
export const cleanupMixedFeatures = (features: GeoJSONStoreFeatures[]) => {
  if (features.length === 0) return features

  const firstFeature = features[0]
  if (!firstFeature) return features

  const firstFamily = getGeometryFamily(firstFeature.geometry.type)
  if (!firstFamily) return features

  // Filter to keep only features of the same type family as the first
  return features.filter((f) => getGeometryFamily(f.geometry.type) === firstFamily)
}
