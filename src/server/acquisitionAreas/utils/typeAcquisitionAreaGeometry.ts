import { AcquisitionArea } from "@/src/prisma/generated/browser"
import { typeGeometry } from "@/src/shared/geometry/typeGeometry"

/**
 * **Never throws** — see `typeSubsectionGeometry`. The geometry is optimistically typed; call
 * `isRenderableGeometry` before handing it to a map helper.
 */
export const typeAcquisitionAreaGeometry = <T extends Pick<AcquisitionArea, "geometry">>(
  acquisitionArea: T,
) => {
  try {
    return { ...acquisitionArea, geometry: typeGeometry(acquisitionArea.geometry, ["POLYGON"]) }
  } catch {
    return { ...acquisitionArea, geometry: acquisitionArea.geometry as never }
  }
}
