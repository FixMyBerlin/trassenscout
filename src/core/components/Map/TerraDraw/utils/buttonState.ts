import { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"

// Helper to determine appropriate mode based on geometry type
// If geometry exists, use select mode to view/edit it
// Otherwise default to linestring for new drawings
export const getDefaultModeForGeometry = (geometry: SupportedGeometry | undefined) => {
  if (!geometry) return "linestring"

  // When geometry exists, start in select mode to view and edit it
  return "select"
}

// Helper to determine which buttons should be enabled based on geometry types
// After cleanupMixedFeatures, there will be at most one geometry type family present
// So we only enable buttons for the type that exists (or all if empty)
export const calculateEnabledButtons = (geometryTypes: Set<string>, hasAnyGeometries: boolean) => {
  const hasPoints = geometryTypes.has("Point") || geometryTypes.has("MultiPoint")
  const hasLines = geometryTypes.has("LineString") || geometryTypes.has("MultiLineString")
  const hasPolygons = geometryTypes.has("Polygon") || geometryTypes.has("MultiPolygon")

  return {
    point: hasPoints,
    linestring: hasLines,
    "freehand-linestring": hasLines, // Enabled when linestring is enabled (same geometry type)
    polygon: hasPolygons,
    edit: hasAnyGeometries,
  }
}
