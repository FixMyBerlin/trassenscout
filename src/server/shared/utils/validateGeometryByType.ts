import {
  LineStringGeometrySchema,
  MultiLineStringGeometrySchema,
  MultiPointGeometrySchema,
  MultiPolygonGeometrySchema,
  PointGeometrySchema,
  PolygonGeometrySchema,
} from "@/src/core/utils/geojson-schemas"
import { GeometryTypeEnum } from "@prisma/client"

/**
 * Validates a geometry object based on the geometry type.
 * Supports single and multi geometries:
 * - POINT → Point or MultiPoint
 * - LINE → LineString or MultiLineString
 * - POLYGON → Polygon or MultiPolygon
 */
export const validateGeometryByType = (type: GeometryTypeEnum, geometry: unknown) => {
  switch (type) {
    case "POINT":
      return PointGeometrySchema.or(MultiPointGeometrySchema).safeParse(geometry)
    case "LINE":
      return LineStringGeometrySchema.or(MultiLineStringGeometrySchema).safeParse(geometry)
    case "POLYGON":
      return PolygonGeometrySchema.or(MultiPolygonGeometrySchema).safeParse(geometry)
  }
}
