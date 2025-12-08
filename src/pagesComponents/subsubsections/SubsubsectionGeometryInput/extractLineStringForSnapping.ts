import {
  LineStringGeometrySchema,
  MultiLineStringGeometrySchema,
  MultiPolygonGeometrySchema,
  PolygonGeometrySchema,
} from "@/src/core/utils/geojson-schemas"
import type { Geometry, LineString } from "geojson"

/**
 * Extracts a LineString from any geometry type for snapping purposes
 * Uses Zod schemas for type validation
 */
export const extractLineStringForSnapping = (geometry: Geometry): LineString | null => {
  // Try LineString first (most common case)
  const lineResult = LineStringGeometrySchema.safeParse(geometry)
  if (lineResult.success) return lineResult.data

  // Try MultiLineString - use first line
  const multiLineResult = MultiLineStringGeometrySchema.safeParse(geometry)
  if (multiLineResult.success && multiLineResult.data.coordinates[0]) {
    return { type: "LineString", coordinates: multiLineResult.data.coordinates[0] }
  }

  // Try Polygon - use outer ring
  const polygonResult = PolygonGeometrySchema.safeParse(geometry)
  if (polygonResult.success && polygonResult.data.coordinates[0]) {
    return { type: "LineString", coordinates: polygonResult.data.coordinates[0] }
  }

  // Try MultiPolygon - use outer ring of first polygon
  const multiPolygonResult = MultiPolygonGeometrySchema.safeParse(geometry)
  if (multiPolygonResult.success && multiPolygonResult.data.coordinates[0]?.[0]) {
    return { type: "LineString", coordinates: multiPolygonResult.data.coordinates[0][0] }
  }

  // Point or unsupported type - can't extract a line
  return null
}
