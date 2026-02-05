import { TGetSubsection } from "@/src/server/subsections/queries/getSubsection"
import { featureCollection, point } from "@turf/helpers"
import { layerColors } from "../layerColors"
import { extractLineEndpoints } from "./extractLineEndpoints"
import { lineStringToGeoJSON } from "./lineStringToGeoJSON"
import { polygonToGeoJSON } from "./polygonToGeoJSON"

type Props = {
  subsections: TGetSubsection[]
  selectedSubsectionSlug: string
}

export const getSubsectionFeatures = ({ subsections, selectedSubsectionSlug }: Props) => {
  const lines = featureCollection(
    subsections
      .flatMap((subsection) => {
        if (subsection.type === "LINE") {
          const isSelected = subsection.slug === selectedSubsectionSlug
          const isDashed = subsection.SubsectionStatus?.style === "DASHED"
          const properties = {
            subsectionSlug: subsection.slug,
            color: isSelected ? layerColors.selectedSubsection : layerColors.unselectableSubsection,
            dashed: isDashed ? true : undefined,
            secondColor: isDashed ? layerColors.dashedSubsectionSecondary : undefined,
          }
          return lineStringToGeoJSON(subsection.geometry, properties)
        }
        return []
      })
      .filter(Boolean),
  )

  const polygons = featureCollection(
    subsections
      .flatMap((subsection) => {
        if (subsection.type === "POLYGON") {
          const isSelected = subsection.slug === selectedSubsectionSlug
          const properties = {
            subsectionSlug: subsection.slug,
            color: isSelected ? layerColors.selectedSubsection : layerColors.unselectableSubsection,
          }
          return polygonToGeoJSON(subsection.geometry, properties)
        }
        return []
      })
      .filter(Boolean),
  )

  // Extract dots for subsection start/end points (default size 6)
  const dots = featureCollection(
    subsections.flatMap((subsection) => {
      if (subsection.type === "LINE") {
        const endpoints = extractLineEndpoints(subsection.geometry)
        return endpoints.map((endpoint) => point(endpoint, { radius: 6 }))
      }
      return []
    }),
  )

  return { lines, polygons, dots }
}
