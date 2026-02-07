import { getCentralPointOfGeometry } from "@/src/core/components/Map/utils/getCentralPointOfGeometry"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"

export const mapillaryLink = (subsubsection: SubsubsectionWithPosition) => {
  const url = new URL("https://www.mapillary.com/app/")
  if (subsubsection.mapillaryKey) {
    url.searchParams.append("pKey", subsubsection.mapillaryKey)
  } else {
    const [lng, lat] = getCentralPointOfGeometry(subsubsection.geometry)
    url.searchParams.append("lat", String(lat))
    url.searchParams.append("lng", String(lng))
    url.searchParams.append("z", String(12))
  }

  url.searchParams.append("panos", String(true))

  const userForFilter = ["supaplex030", "tordans", "stefanhrt"]
  userForFilter.forEach((user) => url.searchParams.append("username[]", user))

  return url.toString()
}
