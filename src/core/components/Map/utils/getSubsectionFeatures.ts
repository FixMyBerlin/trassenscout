import { TGetSubsection } from "@/src/server/subsections/queries/getSubsection"
import { featureCollection } from "@turf/helpers"
import { layerColors } from "../layerColors"
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
          const properties = {
            color:
              subsection.slug === selectedSubsectionSlug
                ? layerColors.unselectableCurrent
                : layerColors.unselectable,
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
          const properties = {
            color:
              subsection.slug === selectedSubsectionSlug
                ? layerColors.unselectableCurrent
                : layerColors.unselectable,
          }
          return polygonToGeoJSON(subsection.geometry, properties)
        }
        return []
      })
      .filter(Boolean),
  )

  return { lines, polygons }
}
