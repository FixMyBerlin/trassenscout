import { SupportedGeoJsonGeometrySchema } from "@/src/shared/geometry/geojsonSchemas"

/**
 * True when the map helpers can actually draw this geometry.
 *
 * The schema encodes exactly what Turf and MapLibre accept: closed polygon rings with enough
 * points, lines with at least two, coordinates inside WGS84. Stored geometry that fails it is bad
 * data, not a programming error — pages filter it out and name it instead of letting it reach a
 * map, where it would throw and take the whole page down.
 */
export const isRenderableGeometry = (geometry: unknown) =>
  SupportedGeoJsonGeometrySchema.safeParse(geometry).success
