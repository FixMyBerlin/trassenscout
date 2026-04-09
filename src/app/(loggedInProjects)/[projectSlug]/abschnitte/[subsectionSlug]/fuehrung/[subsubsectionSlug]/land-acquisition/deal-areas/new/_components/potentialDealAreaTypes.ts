import type { TDealAreaGeometrySchema } from "@/src/server/dealAreas/schema"

export type PotentialDealArea = {
  id: string
  geometry: TDealAreaGeometrySchema
  parcelGeometry: TDealAreaGeometrySchema
  alkisParcelId: string
  alkisParcelIdSource: string
  selected: boolean
}
