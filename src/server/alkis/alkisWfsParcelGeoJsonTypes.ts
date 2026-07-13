import type { FeatureCollection, Geometry } from "geojson"

export type AlkisWfsParcelProperties = Record<string, string | number | boolean | null> & {
  alkisParcelId: string | null
  alkisParcelIdSource: string
}

export type AlkisWfsParcelFeatureCollection = FeatureCollection<Geometry, AlkisWfsParcelProperties>
