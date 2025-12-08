import { Subsection } from "@/db"
import {
  LineStringGeometrySchema,
  MultiLineStringGeometrySchema,
  MultiPointGeometrySchema,
  MultiPolygonGeometrySchema,
  PointGeometrySchema,
  PolygonGeometrySchema,
} from "@/src/core/utils/geojson-schemas"

/**
 * Validates and types a subsection's geometry JSON field using Zod based on the geometry type
 * Supports Point, MultiPoint, LineString, MultiLineString, Polygon, and MultiPolygon
 */
export const typeSubsectionGeometry = <T extends Pick<Subsection, "geometry">>(
  subsection: T,
): Omit<T, "geometry"> & {
  geometry: ReturnType<
    | typeof PointGeometrySchema.parse
    | typeof MultiPointGeometrySchema.parse
    | typeof LineStringGeometrySchema.parse
    | typeof MultiLineStringGeometrySchema.parse
    | typeof PolygonGeometrySchema.parse
    | typeof MultiPolygonGeometrySchema.parse
  >
} => {
  // Try to parse as each geometry type
  let parsedGeometry:
    | ReturnType<typeof PointGeometrySchema.parse>
    | ReturnType<typeof MultiPointGeometrySchema.parse>
    | ReturnType<typeof LineStringGeometrySchema.parse>
    | ReturnType<typeof MultiLineStringGeometrySchema.parse>
    | ReturnType<typeof PolygonGeometrySchema.parse>
    | ReturnType<typeof MultiPolygonGeometrySchema.parse>

  const pointResult = PointGeometrySchema.safeParse(subsection.geometry)
  if (pointResult.success) {
    parsedGeometry = pointResult.data
  } else {
    const multiPointResult = MultiPointGeometrySchema.safeParse(subsection.geometry)
    if (multiPointResult.success) {
      parsedGeometry = multiPointResult.data
    } else {
      const lineResult = LineStringGeometrySchema.safeParse(subsection.geometry)
      if (lineResult.success) {
        parsedGeometry = lineResult.data
      } else {
        const multiLineResult = MultiLineStringGeometrySchema.safeParse(subsection.geometry)
        if (multiLineResult.success) {
          parsedGeometry = multiLineResult.data
        } else {
          const polygonResult = PolygonGeometrySchema.safeParse(subsection.geometry)
          if (polygonResult.success) {
            parsedGeometry = polygonResult.data
          } else {
            // Final attempt: MultiPolygon (will throw if invalid)
            parsedGeometry = MultiPolygonGeometrySchema.parse(subsection.geometry)
          }
        }
      }
    }
  }

  return {
    ...subsection,
    geometry: parsedGeometry,
  }
}
