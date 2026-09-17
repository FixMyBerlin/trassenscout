import { z } from "zod"

/**
 * WGS84 bounds. MapLibre throws "Invalid LngLat latitude value" on anything outside them, and a
 * single out-of-range number is enough to blank a whole map, so it is rejected here instead.
 */
const coordinateRange = { error: "Koordinaten liegen außerhalb des gültigen Bereichs." }
const LongitudeSchema = z.number().min(-180, coordinateRange).max(180, coordinateRange)
const LatitudeSchema = z.number().min(-90, coordinateRange).max(90, coordinateRange)

/** An empty coordinate list yields an infinite bounding box, which MapLibre also rejects. */
const noCoordinates = { error: "Die Geometrie enthält keine Koordinaten." }

// GeoJSON Position: [longitude, latitude]
export const PositionSchema = z.tuple([LongitudeSchema, LatitudeSchema]) // [number, number]
export const PositionArraySchema = z.array(PositionSchema) // [[number, number], ...]

/** Turf's `lineString` rejects anything shorter, and every map helper feeds it straight in. */
const LineCoordinatesSchema = PositionArraySchema.min(2, {
  error: "Eine Linie braucht mindestens 2 Punkte.",
})

/**
 * GeoJSON LinearRing: 4+ positions with the first and last identical (RFC 7946).
 * Turf throws on rings that break either rule, and every map helper downstream assumes the
 * geometry it receives is renderable, so the boundary has to reject them here. Without this the
 * schema accepts polygons that blow up much later, deep inside a map component.
 */
const LinearRingSchema = z
  .array(PositionSchema)
  .min(4, { error: "Ein Polygon-Ring braucht mindestens 4 Punkte." })
  .refine((ring) => {
    const first = ring[0]
    const last = ring.at(-1)
    return Boolean(first && last && first[0] === last[0] && first[1] === last[1])
  }, "Ein Polygon-Ring muss geschlossen sein.")

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
  coordinates: PositionArraySchema.min(1, noCoordinates),
})

export const LineStringGeometrySchema = z.object({
  type: z.literal("LineString"),
  coordinates: LineCoordinatesSchema,
})

export const MultiLineStringGeometrySchema = z.object({
  type: z.literal("MultiLineString"),
  coordinates: z.array(LineCoordinatesSchema).min(1, noCoordinates),
})

export const PolygonGeometrySchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(LinearRingSchema).min(1, noCoordinates),
})

export const MultiPolygonGeometrySchema = z.object({
  type: z.literal("MultiPolygon"),
  coordinates: z.array(z.array(LinearRingSchema).min(1, noCoordinates)).min(1, noCoordinates),
})

export const PointLikeGeometrySchema = z.discriminatedUnion("type", [
  PointGeometrySchema,
  MultiPointGeometrySchema,
])

export const LineLikeGeometrySchema = z.discriminatedUnion("type", [
  LineStringGeometrySchema,
  MultiLineStringGeometrySchema,
])

export const PolygonLikeGeometrySchema = z.discriminatedUnion("type", [
  PolygonGeometrySchema,
  MultiPolygonGeometrySchema,
])

/** All supported GeoJSON geometry types (excludes GeometryCollection). */
export const SupportedGeoJsonGeometrySchema = z.discriminatedUnion("type", [
  PointGeometrySchema,
  MultiPointGeometrySchema,
  LineStringGeometrySchema,
  MultiLineStringGeometrySchema,
  PolygonGeometrySchema,
  MultiPolygonGeometrySchema,
])
