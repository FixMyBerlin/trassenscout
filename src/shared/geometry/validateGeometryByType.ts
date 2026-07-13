import { GeometryTypeEnum } from "@/src/prisma/generated/browser"
import {
  LineLikeGeometrySchema,
  PointLikeGeometrySchema,
  PolygonLikeGeometrySchema,
} from "@/src/shared/geometry/geojsonSchemas"

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
      return PointLikeGeometrySchema.safeParse(geometry)
    case "LINE":
      return LineLikeGeometrySchema.safeParse(geometry)
    case "POLYGON":
      return PolygonLikeGeometrySchema.safeParse(geometry)
  }
}
