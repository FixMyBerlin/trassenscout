import type { LineString, MultiLineString, MultiPoint, MultiPolygon, Point, Polygon } from "geojson"
import { z } from "zod"
import { GeometryTypeEnum } from "@/src/prisma/generated/client"
import {
  LineLikeGeometrySchema,
  PointLikeGeometrySchema,
  PolygonLikeGeometrySchema,
  SupportedGeoJsonGeometrySchema,
} from "@/src/shared/geometry/geojsonSchemas"

/**
 * Shared geometry union schema for subsections and subsubsections
 * Supports: Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon
 * Note: GeometryCollection is NOT supported
 */
export const SupportedGeometrySchema = SupportedGeoJsonGeometrySchema

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
  ? z.infer<typeof PointLikeGeometrySchema>
  : T extends "LINE"
    ? z.infer<typeof LineLikeGeometrySchema>
    : T extends "POLYGON"
      ? z.infer<typeof PolygonLikeGeometrySchema>
      : never

/**
 * Discriminated union: Prisma GeometryTypeEnum must match GeoJSON geometry family.
 */
export const GeometryWithTypeSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(GeometryTypeEnum.POINT),
    geometry: PointLikeGeometrySchema,
  }),
  z.object({
    type: z.literal(GeometryTypeEnum.LINE),
    geometry: LineLikeGeometrySchema,
  }),
  z.object({
    type: z.literal(GeometryTypeEnum.POLYGON),
    geometry: PolygonLikeGeometrySchema,
  }),
])

/**
 * Subsection geometry: LINE and POLYGON enum types only (no POINT).
 */
export const SubsectionGeometryWithTypeSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(GeometryTypeEnum.LINE),
    geometry: LineLikeGeometrySchema,
  }),
  z.object({
    type: z.literal(GeometryTypeEnum.POLYGON),
    geometry: PolygonLikeGeometrySchema,
  }),
])

/**
 * Discriminated union type helper: creates a union of { type, geometry } pairs
 * where type matches the corresponding geometry type from GeometryByGeometryType
 */
export type GeometryWithTypeDiscriminated = z.infer<typeof GeometryWithTypeSchema>
