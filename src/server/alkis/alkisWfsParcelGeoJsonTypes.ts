import type { FeatureCollection, Geometry } from "geojson"

export type AlkisWfsParcelProperties = Record<string, unknown> & {
  alkisParcelId: string | null
  alkisParcelIdSource: string
}

export type AlkisWfsParcelFeatureCollection = FeatureCollection<Geometry, AlkisWfsParcelProperties>
