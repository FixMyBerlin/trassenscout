import type { MultiPolygon, Polygon } from "geojson"

export type PotentialDealArea = {
  id: string
  geometry: Polygon | MultiPolygon
  gmlId: string
  selected: boolean
}
