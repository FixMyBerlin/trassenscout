import { lineString } from "@turf/helpers"

export const geometryStartEndPoint = (geometryString: string) => {
  const geometry = JSON.parse(geometryString)

  return lineString([geometry[0], geometry[geometry.length - 1]])
}
