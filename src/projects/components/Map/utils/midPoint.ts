import { Position } from "@turf/helpers"
import length from "@turf/length"
import along from "@turf/along"
import { lineString } from "@turf/turf"

export const midPoint = (points: Position[]): Position => {
  const line = lineString(points)
  return along(line, length(line) / 2).geometry.coordinates
}
