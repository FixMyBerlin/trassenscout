import { getCenterOfMass } from "@/src/core/components/Map/utils/getCenterOfMass"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"

//** @desc A mapillary link, either for a given key *OR* for a given lat/lng */
export const mapillaryLink = (subsubsection: SubsubsectionWithPosition) => {
  const url = new URL("https://www.mapillary.com/app/")
  if (subsubsection.mapillaryKey) {
    url.searchParams.append("pKey", subsubsection.mapillaryKey)
  } else {
    const [lng, lat] = getCenterOfMass(subsubsection.geometry)
    url.searchParams.append("lat", String(lat))
    url.searchParams.append("lng", String(lng))
    url.searchParams.append("z", String(12)) // does not really matter, Mapillary will zoom on the pKey image.
  }

  url.searchParams.append("panos", String(true))

  const userForFilter = ["supaplex030", "tordans", "stefanhrt"]
  userForFilter.forEach((user) => url.searchParams.append("username[]", user))

  return url.toString()
}
