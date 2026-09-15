import { Subsubsection } from "@/src/prisma/generated/browser"
import { typeGeometry } from "@/src/shared/geometry/typeGeometry"

/**
 * **Never throws** — see `typeSubsectionGeometry`. The geometry is optimistically typed; call
 * `isRenderableGeometry` before handing it to a map helper.
 */
export const typeSubsubsectionGeometry = <T extends Pick<Subsubsection, "geometry" | "type">>(
  subsubsection: T,
) => {
  try {
    return {
      ...subsubsection,
      geometry: typeGeometry(subsubsection.geometry, ["POINT", "LINE", "POLYGON"]),
    }
  } catch {
    return { ...subsubsection, geometry: subsubsection.geometry as never }
  }
}
