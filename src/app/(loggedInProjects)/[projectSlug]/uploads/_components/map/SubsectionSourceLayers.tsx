"use client"

import { layerColors } from "@/src/core/components/Map/layerColors"
import { SelectableLinesLayer } from "@/src/core/components/Map/layers/SelectableLinesLayer"
import { SelectablePolygonsLayer } from "@/src/core/components/Map/layers/SelectablePolygonsLayer"
import { lineStringToGeoJSON } from "@/src/core/components/Map/utils/lineStringToGeoJSON"
import { polygonToGeoJSON } from "@/src/core/components/Map/utils/polygonToGeoJSON"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import { useQuery } from "@blitzjs/rpc"
import { featureCollection } from "@turf/helpers"
import { useMemo } from "react"

type Props = {
  selectedSubsectionId?: number | null
}

export const SubsectionSourceLayers = ({ selectedSubsectionId }: Props) => {
  const projectSlug = useProjectSlug()
  const [{ subsections }] = useQuery(getSubsections, {
    projectSlug,
    take: 500,
  })

  const selectableLines = useMemo(() => {
    return featureCollection(
      subsections
        .filter((subsection) => subsection.type === "LINE")
        .flatMap((subsection) => {
          const properties = {
            subsectionSlug: subsection.slug,
            color:
              subsection.id === selectedSubsectionId
                ? layerColors.selectedBlue
                : layerColors.unselectedGray,
            opacity: subsection.id === selectedSubsectionId ? 1 : 0.6,
          }
          return lineStringToGeoJSON<typeof properties>(subsection.geometry, properties)
        }),
    )
  }, [subsections, selectedSubsectionId])

  const selectablePolygons = useMemo(() => {
    return featureCollection(
      subsections
        .filter((subsection) => subsection.type === "POLYGON")
        .flatMap((subsection) => {
          const properties = {
            subsectionSlug: subsection.slug,
            color:
              subsection.id === selectedSubsectionId
                ? layerColors.selectedBlue
                : layerColors.unselectedGray,
            opacity: subsection.id === selectedSubsectionId ? 1 : 0.6,
          }
          return polygonToGeoJSON<typeof properties>(subsection.geometry, properties)
        })
        .filter(Boolean),
    )
  }, [subsections, selectedSubsectionId])

  return (
    <>
      <SelectableLinesLayer selectableLines={selectableLines} />
      <SelectablePolygonsLayer selectablePolygons={selectablePolygons} />
    </>
  )
}
