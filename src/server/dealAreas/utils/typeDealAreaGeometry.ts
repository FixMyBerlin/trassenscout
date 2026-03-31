import { DealArea } from "@/db"
import { typeGeometry } from "@/src/server/shared/utils/typeGeometry"

export const typeDealAreaGeometry = <T extends Pick<DealArea, "geometry">>(dealArea: T) => {
  const typedGeometry = typeGeometry(dealArea.geometry, ["POLYGON"])

  return {
    ...dealArea,
    geometry: typedGeometry,
  }
}
