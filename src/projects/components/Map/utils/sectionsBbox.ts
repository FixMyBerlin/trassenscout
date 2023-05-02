import combine from "@turf/combine"
import { BBox, bbox, bboxPolygon, featureCollection, lineString } from "@turf/turf"
import type { LngLatBoundsLike } from "react-map-gl"
import { ProjectMapSections } from "../ProjectMap"

export const sectionsBbox = (sections: ProjectMapSections) => {
  // Calculate the bbox of all subSections by first creating a bbox per subSection, then make a polygon out of those, then calculate the bbox for all those polygons. It's likely this could be done easier…
  const subSectionBboxes: BBox[] = []
  sections.forEach((s) => {
    s.subsections.forEach((ss) => {
      subSectionBboxes.push(bbox(lineString(JSON.parse(ss.geometry))))
    })
  })
  const subSectionBoxes = combine(
    featureCollection(subSectionBboxes.map((box) => bboxPolygon(box)))
  )

  const [minX, minY, maxX, maxY] = bbox(subSectionBoxes)
  return [minX, minY, maxX, maxY] as LngLatBoundsLike
}
