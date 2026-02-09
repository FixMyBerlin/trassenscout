import {
  LineStringGeometrySchema,
  MultiLineStringGeometrySchema,
  MultiPolygonGeometrySchema,
  PolygonGeometrySchema,
} from "@/src/core/utils/geojson-schemas"
import type { Geometry, LineString } from "geojson"

export const extractLineStringForSnapping = (geometry: Geometry): LineString | null => {
  const lineResult = LineStringGeometrySchema.safeParse(geometry)
  if (lineResult.success) return lineResult.data

  const multiLineResult = MultiLineStringGeometrySchema.safeParse(geometry)
  if (multiLineResult.success && multiLineResult.data.coordinates[0]) {
    return { type: "LineString", coordinates: multiLineResult.data.coordinates[0] }
  }

  const polygonResult = PolygonGeometrySchema.safeParse(geometry)
  if (polygonResult.success && polygonResult.data.coordinates[0]) {
    return { type: "LineString", coordinates: polygonResult.data.coordinates[0] }
  }

  const multiPolygonResult = MultiPolygonGeometrySchema.safeParse(geometry)
  if (multiPolygonResult.success && multiPolygonResult.data.coordinates[0]?.[0]) {
    return { type: "LineString", coordinates: multiPolygonResult.data.coordinates[0][0] }
  }

  return null
}
