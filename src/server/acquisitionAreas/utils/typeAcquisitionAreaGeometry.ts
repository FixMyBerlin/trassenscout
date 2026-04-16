import { AcquisitionArea } from "@/db"
import { typeGeometry } from "@/src/server/shared/utils/typeGeometry"

export const typeAcquisitionAreaGeometry = <T extends Pick<AcquisitionArea, "geometry">>(
  acquisitionArea: T,
) => {
  const typedGeometry = typeGeometry(acquisitionArea.geometry, ["POLYGON"])

  return {
    ...acquisitionArea,
    geometry: typedGeometry,
  }
}
