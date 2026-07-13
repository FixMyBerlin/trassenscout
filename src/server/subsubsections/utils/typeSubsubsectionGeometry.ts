import { Subsubsection } from "@/src/prisma/generated/browser"
import { typeGeometry } from "@/src/shared/geometry/typeGeometry"

export const typeSubsubsectionGeometry = <T extends Pick<Subsubsection, "geometry" | "type">>(
  subsubsection: T,
) => {
  const typedGeometry = typeGeometry(subsubsection.geometry, ["POINT", "LINE", "POLYGON"])
  return {
    ...subsubsection,
    geometry: typedGeometry,
  }
}
