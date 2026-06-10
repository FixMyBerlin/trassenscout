import type { LngLatBoundsLike } from "react-map-gl/maplibre"

/**
 * Approximate bounding box for Germany (WGS84): [west, south, east, north].
 * Map screens use this only when they have no project geometry to fit (e.g. new Subsection).
 */
export const GERMANY_VIEW_BOUNDS: LngLatBoundsLike = [
  5.98865807458, 47.3024876979, 15.0169958839, 54.983104153,
]
