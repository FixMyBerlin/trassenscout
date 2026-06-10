import { AcquisitionArea } from "@/src/prisma/generated/client"
import { typeGeometry } from "@/src/shared/geometry/typeGeometry"

export const typeAcquisitionAreaGeometry = <T extends Pick<AcquisitionArea, "geometry">>(
  acquisitionArea: T,
) => {
  const typedGeometry = typeGeometry(acquisitionArea.geometry, ["POLYGON"])

  return {
    ...acquisitionArea,
    geometry: typedGeometry,
  }
}
