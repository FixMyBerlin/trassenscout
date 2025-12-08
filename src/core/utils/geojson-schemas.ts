import { z } from "zod"

// GeoJSON Position: [longitude, latitude]
const PositionSchema = z.tuple([z.number(), z.number()]) // [number, number]
const PositionArraySchema = z.array(PositionSchema) // [[number, number], ...]
const PositionArrayArraySchema = z.array(PositionArraySchema) // [[[number, number], ...], ...]
const PositionArrayArrayArraySchema = z.array(PositionArrayArraySchema) // [[[[number, number], ...], ...], ...]

/**
 * GeoJSON Geometry schemas for validation.
 * These schemas validate the structure of GeoJSON geometry objects.
 */
export const PointGeometrySchema = z.object({
  type: z.literal("Point"),
  coordinates: PositionSchema,
})

export const MultiPointGeometrySchema = z.object({
  type: z.literal("MultiPoint"),
  coordinates: PositionArraySchema,
})

export const LineStringGeometrySchema = z.object({
  type: z.literal("LineString"),
  coordinates: PositionArraySchema.min(2),
})

export const MultiLineStringGeometrySchema = z.object({
  type: z.literal("MultiLineString"),
  coordinates: PositionArrayArraySchema,
})

export const PolygonGeometrySchema = z.object({
  type: z.literal("Polygon"),
  coordinates: PositionArrayArraySchema,
})

export const MultiPolygonGeometrySchema = z.object({
  type: z.literal("MultiPolygon"),
  coordinates: PositionArrayArrayArraySchema,
})
