import {
  LineStringGeometrySchema,
  MultiLineStringGeometrySchema,
  MultiPointGeometrySchema,
  MultiPolygonGeometrySchema,
  PointGeometrySchema,
  PolygonGeometrySchema,
} from "@/src/core/utils/geojson-schemas"
import { GeometryTypeEnum } from "@prisma/client"
import type { LineString, MultiLineString, MultiPoint, MultiPolygon, Point, Polygon } from "geojson"
import { z } from "zod"

/**
 * Shared geometry union schema for subsections and subsubsections
 * Supports: Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon
 * Note: GeometryCollection is NOT supported
 */
export const SupportedGeometrySchema = z.union([
  PointGeometrySchema,
  MultiPointGeometrySchema,
  LineStringGeometrySchema,
  MultiLineStringGeometrySchema,
  PolygonGeometrySchema,
  MultiPolygonGeometrySchema,
])

/**
 * Shared geometry type - excludes GeometryCollection
 * Supports: Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon
 * Used for both subsections and subsubsections
 */
export type SupportedGeometry =
  | Point
  | MultiPoint
  | LineString
  | MultiLineString
  | Polygon
  | MultiPolygon

/**
 * Type helper: infer geometry type from GeometryTypeEnum
 * Used for both subsections and subsubsections
 */
export type GeometryByGeometryType<T extends GeometryTypeEnum> = T extends "POINT"
  ? z.infer<typeof PointGeometrySchema> | z.infer<typeof MultiPointGeometrySchema>
  : T extends "LINE"
    ? z.infer<typeof LineStringGeometrySchema> | z.infer<typeof MultiLineStringGeometrySchema>
    : T extends "POLYGON"
      ? z.infer<typeof PolygonGeometrySchema> | z.infer<typeof MultiPolygonGeometrySchema>
      : never

/**
 * Discriminated union type helper: creates a union of { type, geometry } pairs
 * where type matches the corresponding geometry type from GeometryByGeometryType
 * Used for subsubsections (and potentially subsections if stricter typing is needed)
 */
export type GeometryWithTypeDiscriminated =
  | {
      type: typeof GeometryTypeEnum.POINT
      geometry: GeometryByGeometryType<"POINT">
    }
  | {
      type: typeof GeometryTypeEnum.LINE
      geometry: GeometryByGeometryType<"LINE">
    }
  | {
      type: typeof GeometryTypeEnum.POLYGON
      geometry: GeometryByGeometryType<"POLYGON">
    }
