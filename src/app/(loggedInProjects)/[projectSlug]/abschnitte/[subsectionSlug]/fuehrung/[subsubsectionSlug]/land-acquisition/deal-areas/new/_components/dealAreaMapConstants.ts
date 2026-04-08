import type { FeatureCollection, Geometry } from "geojson"

export const MIN_FETCH_ZOOM = 14
export const FETCH_DEBOUNCE_MS = 300
export const MAX_FEATURES = 5000

export const emptyFeatureCollection: FeatureCollection<Geometry, Record<string, unknown>> = {
  type: "FeatureCollection",
  features: [],
}

export const PARCEL_LAYER_IDS = [
  "alkis-parcels-fill-hit",
  "alkis-parcels-line-base",
  "alkis-parcels-line-dash",
] as const
