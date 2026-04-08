import type { TDealAreaGeometrySchema } from "@/src/server/dealAreas/schema"

export type PotentialDealArea = {
  id: string
  geometry: TDealAreaGeometrySchema
  gmlId: string
  selected: boolean
}
