import type { TDealAreaGeometrySchema } from "@/src/server/dealAreas/schema"

export type PotentialDealArea = {
  id: string
  geometry: TDealAreaGeometrySchema
  parcelGeometry: TDealAreaGeometrySchema
  alkisParcelId: string | null
  alkisParcelIdSource: string
  selected: boolean
}
