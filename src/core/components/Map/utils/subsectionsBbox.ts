import { SubsectionWithPosition } from "@/src/server/subsections/queries/getSubsection"
import combine from "@turf/combine"
import { bbox, bboxPolygon, featureCollection, lineString } from "@turf/turf"
import type { BBox } from "geojson"
import type { LngLatBoundsLike } from "react-map-gl/maplibre"

export const subsectionsBbox = (subsections: SubsectionWithPosition[]) => {
  // Calculate the bbox of all subSections by first creating a bbox per subSection, then make a polygon out of those, then calculate the bbox for all those polygons. It's likely this could be done easier…
  const subSectionBboxes: BBox[] = []
  subsections.forEach((ss) => {
    subSectionBboxes.push(bbox(lineString(ss.geometry)))
  })
  const subSectionBoxes = combine(
    featureCollection(subSectionBboxes.map((box) => bboxPolygon(box))),
  )

  const [minX, minY, maxX, maxY] = bbox(subSectionBoxes)
  return [minX, minY, maxX, maxY] as LngLatBoundsLike
}
