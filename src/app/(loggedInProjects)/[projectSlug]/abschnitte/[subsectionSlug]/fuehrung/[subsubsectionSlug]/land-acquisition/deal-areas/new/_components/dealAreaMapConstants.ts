import type { FeatureCollection, Geometry } from "geojson"

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
