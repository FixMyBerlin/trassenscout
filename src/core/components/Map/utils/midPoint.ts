import along from "@turf/along"
import length from "@turf/length"
import { lineString } from "@turf/turf"
import type { Position } from "geojson"

export const midPoint = (points: Position[]): Position => {
  const line = lineString(points)
  return along(line, length(line) / 2).geometry.coordinates
}
