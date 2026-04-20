import type { TAcquisitionAreaGeometrySchema } from "@/src/server/acquisitionAreas/schema"

export type ExistingAcquisitionAreaMode = "keep" | "update"

export type PotentialAcquisitionArea = {
  id: string
  geometry: TAcquisitionAreaGeometrySchema
  parcelGeometry: TAcquisitionAreaGeometrySchema
  alkisParcelId: string | null
  alkisParcelIdSource: string
  selected: boolean
  existingAcquisitionAreaId: number | null
  existingMode: ExistingAcquisitionAreaMode
}
