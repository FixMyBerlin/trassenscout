import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { featureCollection } from "@turf/helpers"
import { layerColors } from "../layerColors"
import { extractLineEndpoints } from "./extractLineEndpoints"
import { lineStringToGeoJSON } from "./lineStringToGeoJSON"
import { pointToGeoJSON } from "./pointToGeoJSON"
import { polygonToGeoJSON } from "./polygonToGeoJSON"

type Props = {
  subsubsections: SubsubsectionWithPosition[]
  selectedSubsubsectionSlug: string | null
  hoveredMap: string | number | null
  hoveredMarker: string | number | null
}

export const getSubsubsectionFeatures = ({
  subsubsections,
  selectedSubsubsectionSlug,
  hoveredMap,
  hoveredMarker,
}: Props) => {
  const selectableLines = featureCollection(
    subsubsections
      .filter((sec) => sec.type === "LINE")
      .flatMap((sec) => {
        const properties = {
          subsectionSlug: sec.subsection.slug,
          subsubsectionSlug: sec.slug,
          color:
            sec.slug === selectedSubsubsectionSlug
              ? layerColors.selected
              : hoveredMap === sec.slug || hoveredMarker === sec.slug
                ? layerColors.hovered
                : layerColors.selectable,
        }
        return lineStringToGeoJSON<typeof properties>(sec.geometry, properties)
      }),
  )

  const selectablePoints = featureCollection(
    subsubsections
      .filter((sec) => sec.type === "POINT")
      .flatMap((sec) => {
        const properties = {
          subsectionSlug: sec.subsection.slug,
          subsubsectionSlug: sec.slug,
          opacity: 0.3,
          color:
            sec.slug === selectedSubsubsectionSlug
              ? layerColors.selected
              : hoveredMap === sec.slug || hoveredMarker === sec.slug
                ? layerColors.hovered
                : layerColors.selectable,
          radius: 10,
          "border-width": 3,
          "border-color":
            sec.slug === selectedSubsubsectionSlug
              ? layerColors.selected
              : hoveredMap === sec.slug || hoveredMarker === sec.slug
                ? layerColors.hovered
                : layerColors.selectable,
        }
        return pointToGeoJSON<typeof properties>(sec.geometry, properties)
      }),
  )

  const selectablePolygons = featureCollection(
    subsubsections
      .filter((sec) => sec.type === "POLYGON")
      .flatMap((sec) => {
        const properties = {
          subsectionSlug: sec.subsection.slug,
          subsubsectionSlug: sec.slug,
          color:
            sec.slug === selectedSubsubsectionSlug
              ? layerColors.selected
              : hoveredMap === sec.slug || hoveredMarker === sec.slug
                ? layerColors.hovered
                : layerColors.selectable,
        }
        return polygonToGeoJSON<typeof properties>(sec.geometry, properties)
      })
      .filter(Boolean),
  )

  const dotsGeoms = subsubsections.flatMap((sec) => {
    if (sec.geometry.type === "LineString" || sec.geometry.type === "MultiLineString") {
      return extractLineEndpoints(sec.geometry)
    }
    return []
  })

  return {
    selectableLines,
    selectablePoints,
    selectablePolygons,
    dotsGeoms,
  }
}
