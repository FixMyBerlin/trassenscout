import type { TAcquisitionAreaGeometrySchema } from "@/src/server/acquisitionAreas/schema"

export type PotentialAcquisitionArea = {
  id: string
  geometry: TAcquisitionAreaGeometrySchema
  parcelGeometry: TAcquisitionAreaGeometrySchema
  alkisParcelId: string | null
  alkisParcelIdSource: string
  selected: boolean
}
