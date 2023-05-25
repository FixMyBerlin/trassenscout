import { bbox, lineString } from "@turf/turf"
import { SubsubsectionWithPosition } from "src/subsubsections/queries/getSubsubsection"

export const mapillaryLink = (subsubsection: SubsubsectionWithPosition) => {
  if (!subsubsection.mapillaryKey) return null

  const url = new URL("https://www.mapillary.com/app/")
  url.searchParams.append("pKey", subsubsection.mapillaryKey)

  const [lng, _1, _2, lat] =
    subsubsection.type === "ROUTE"
      ? bbox(lineString(subsubsection.geometry))
      : bbox(lineString([subsubsection.geometry]))
  url.searchParams.append("lat", String(lat))
  url.searchParams.append("lng", String(lng))

  url.searchParams.append("z", String(12)) // does not really matter, Mapillary will zoom on the pKey image.
  url.searchParams.append("panos", String(true))

  const userForFilter = ["supaplex030", "tordans", "stefanhrt"]
  userForFilter.forEach((user) => url.searchParams.append("username[]", user))

  return url.toString()
}
