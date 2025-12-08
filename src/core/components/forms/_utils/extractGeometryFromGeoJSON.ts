import { FeatureCollectionSchema, FeatureSchema } from "@/src/server/subsections/schema"

/**
 * Extracts GeoJSON geometry from input (Feature, FeatureCollection, or Geometry)
 * Returns the full GeoJSON geometry object that can be stored directly.
 * Supports: Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon
 */
export const extractGeometryFromGeoJSON = (text: string) => {
  let parsed: unknown
  try {
    parsed = JSON.parse(text) as unknown
  } catch {
    return null
  }

  const processGeometry = (geometry: any) => {
    if (!geometry) return null
    const t = geometry.type as string
    if (
      t === "Point" ||
      t === "MultiPoint" ||
      t === "LineString" ||
      t === "MultiLineString" ||
      t === "Polygon" ||
      t === "MultiPolygon"
    ) {
      return { geometry: geometry, geometryType: t }
    }
    return null
  }

  // Handle FeatureCollection - combine geometries if needed
  const featureCollectionResult = FeatureCollectionSchema.safeParse(parsed)
  if (featureCollectionResult.success && featureCollectionResult.data.features.length > 0) {
    const features = featureCollectionResult.data.features
    const geometries = features.map((f) => f?.geometry).filter(Boolean)

    if (geometries.length === 0) return null

    // Check if all geometries are Point - combine into MultiPoint
    if (geometries.every((g) => g?.type === "Point")) {
      const coordinates = geometries.map((g) => g!.coordinates as number[])
      return processGeometry({ type: "MultiPoint", coordinates })
    }

    // Check if all geometries are LineString - combine into MultiLineString
    if (geometries.every((g) => g?.type === "LineString")) {
      const coordinates = geometries.map((g) => g!.coordinates as number[][])
      return processGeometry({ type: "MultiLineString", coordinates })
    }

    // Check if all geometries are Polygon - combine into MultiPolygon
    if (geometries.every((g) => g?.type === "Polygon")) {
      const coordinates = geometries.map((g) => g!.coordinates as number[][][])
      return processGeometry({ type: "MultiPolygon", coordinates })
    }

    // If there's a MultiPoint, MultiLineString or MultiPolygon, use the first one
    const multiGeometry = geometries.find(
      (g) =>
        g?.type === "MultiPoint" || g?.type === "MultiLineString" || g?.type === "MultiPolygon",
    )
    if (multiGeometry) {
      return processGeometry(multiGeometry)
    }

    // Otherwise, use the first feature's geometry
    const firstFeature = features[0]
    return processGeometry(firstFeature?.geometry)
  }

  // Handle Feature - extract geometry
  const featureResult = FeatureSchema.safeParse(parsed)
  if (featureResult.success && featureResult.data.geometry) {
    return processGeometry(featureResult.data.geometry)
  }

  // Handle direct Geometry object
  if (parsed && typeof parsed === "object" && "type" in parsed && "coordinates" in parsed) {
    return processGeometry(parsed)
  }

  return null
}
