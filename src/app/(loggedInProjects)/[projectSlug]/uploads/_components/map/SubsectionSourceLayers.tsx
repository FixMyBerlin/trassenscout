"use client"

import { layerColors } from "@/src/core/components/Map/layerColors"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import { useQuery } from "@blitzjs/rpc"
import { featureCollection, lineString } from "@turf/helpers"
import { useMemo } from "react"
import { Layer, Source } from "react-map-gl/maplibre"

const selectableLineLayerId = "layer_selectable_line_features"

type Props = {
  selectedSubsectionId?: number | null
}

export const SubsectionSourceLayers = ({ selectedSubsectionId }: Props) => {
  const projectSlug = useProjectSlug()
  const [{ subsections }] = useQuery(getSubsections, {
    projectSlug,
    take: 500,
  })

  // TODO: Handle other geometry types
  const selectableLines = useMemo(() => {
    return featureCollection(
      subsections
        .map((subsection) => {
          if (subsection.geometry.type !== "LineString") return null
          return lineString(subsection.geometry.coordinates, {
            subsectionSlug: subsection.slug,
            color: subsection.id === selectedSubsectionId ? "#2563eb" : "#64748b",
            opacity: subsection.id === selectedSubsectionId ? 1 : 0.6,
          })
        })
        .filter(Boolean),
    )
  }, [subsections, selectedSubsectionId])

  if (!selectableLines.features.length) return null

  return (
    <Source id={selectableLineLayerId} type="geojson" data={selectableLines}>
      <Layer
        id={`${selectableLineLayerId}-outline`}
        type="line"
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
        paint={{
          "line-width": 9,
          "line-color": layerColors.dot,
          "line-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 0.6],
        }}
      />
      <Layer
        id={`${selectableLineLayerId}-solid`}
        type="line"
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
        paint={{
          "line-width": 7,
          "line-color": ["case", ["has", "color"], ["get", "color"], "black"],
          "line-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 1],
        }}
      />
    </Source>
  )
}
