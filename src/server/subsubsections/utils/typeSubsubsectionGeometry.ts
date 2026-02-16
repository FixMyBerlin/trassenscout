import { Subsubsection } from "@/db"
import { typeGeometry } from "@/src/server/shared/utils/typeGeometry"

export const typeSubsubsectionGeometry = <T extends Pick<Subsubsection, "geometry" | "type">>(
  subsubsection: T,
) => {
  const typedGeometry = typeGeometry(subsubsection.geometry, ["POINT", "LINE", "POLYGON"])
  return {
    ...subsubsection,
    geometry: typedGeometry,
  }
}
