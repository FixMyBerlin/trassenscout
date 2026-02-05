import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { featureCollection, point } from "@turf/helpers"
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
        const isSelected = sec.slug === selectedSubsubsectionSlug
        const isHovered = hoveredMap === sec.slug || hoveredMarker === sec.slug
        const isDashed = sec.SubsubsectionStatus?.style === "DASHED"
        const properties = {
          subsectionSlug: sec.subsection.slug,
          subsubsectionSlug: sec.slug,
          color: isSelected
            ? layerColors.selected
            : isHovered
              ? layerColors.hovered
              : layerColors.entryDefault,
          dashed: isDashed ? true : undefined,
          secondColor: isDashed ? layerColors.dashedEntrySecondary : undefined,
        }
        return lineStringToGeoJSON<typeof properties>(sec.geometry, properties)
      }),
  )

  const selectablePoints = featureCollection(
    subsubsections
      .filter((sec) => sec.type === "POINT")
      .flatMap((sec) => {
        const isSelected = sec.slug === selectedSubsubsectionSlug
        const isHovered = hoveredMap === sec.slug || hoveredMarker === sec.slug
        const color = isSelected
          ? layerColors.selected
          : isHovered
            ? layerColors.hovered
            : layerColors.entryDefault
        const properties = {
          subsectionSlug: sec.subsection.slug,
          subsubsectionSlug: sec.slug,
          opacity: 0.3,
          color,
          radius: 10,
          "border-width": 3,
          "border-color": color,
        }
        return pointToGeoJSON<typeof properties>(sec.geometry, properties)
      }),
  )

  const selectablePolygons = featureCollection(
    subsubsections
      .filter((sec) => sec.type === "POLYGON")
      .flatMap((sec) => {
        const isSelected = sec.slug === selectedSubsubsectionSlug
        const isHovered = hoveredMap === sec.slug || hoveredMarker === sec.slug
        const properties = {
          subsectionSlug: sec.subsection.slug,
          subsubsectionSlug: sec.slug,
          color: isSelected
            ? layerColors.selected
            : isHovered
              ? layerColors.hovered
              : layerColors.entryDefault,
        }
        return polygonToGeoJSON<typeof properties>(sec.geometry, properties)
      })
      .filter(Boolean),
  )

  // Extract dots for entry start/end points (smaller size 4)
  const dotsGeoms = featureCollection(
    subsubsections.flatMap((sec) => {
      if (sec.geometry.type === "LineString" || sec.geometry.type === "MultiLineString") {
        const endpoints = extractLineEndpoints(sec.geometry)
        return endpoints.map((endpoint) => point(endpoint, { radius: 4 }))
      }
      return []
    }),
  )

  return {
    selectableLines,
    selectablePoints,
    selectablePolygons,
    dotsGeoms,
  }
}
