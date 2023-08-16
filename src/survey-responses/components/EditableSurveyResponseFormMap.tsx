import { featureCollection, lineString, point } from "@turf/helpers"
import { midpoint, nearestPointOnLine } from "@turf/turf"
import React from "react"
import { Layer, Marker, Source } from "react-map-gl/maplibre"
import { BaseMap } from "src/core/components/Map/BaseMap"
import { layerColors } from "src/core/components/Map/layerColors"
import { subsectionsBbox } from "src/core/components/Map/utils"
import { SubsectionWithPosition } from "src/subsections/queries/getSubsection"
import { MapPinIcon } from "@heroicons/react/20/solid"

type Props = {
  responsePoint: { lat: number; lng: number } | undefined
  subsections: SubsectionWithPosition[]
}

export const EditableSurveyResponseFormMap: React.FC<Props> = ({ responsePoint, subsections }) => {
  const bbox = subsectionsBbox(subsections)

  // Group subsection linestrings by operator:
  let prevOperatorId: number | undefined
  let lineColor = layerColors.selectable

  const collectedLines: ReturnType<typeof lineString>[] = []
  const collectedLabels: Record<string, any>[] = []

  subsections.forEach((sub) => {
    // Toggle color whenever the operator changed
    if (sub.operator?.id !== prevOperatorId) {
      lineColor =
        lineColor === layerColors.selectable ? layerColors.selected : layerColors.selectable
    }

    // Collect lines
    collectedLines.push(lineString(sub.geometry, { name: sub.operator?.title, color: lineColor }))

    // Collect label data
    // We want one label per operator.
    // Ideally that label would be positioned in the center of the merged linestrings.
    // However, in the future our linestrings might not be mergable.
    // Therefore, we pick the first linestring and accept the missplacement in some situation…
    const fakeCenter = midpoint(sub.geometry.at(0)!, sub.geometry.at(-1)!)
    const pointOnLine = nearestPointOnLine(lineString(sub.geometry), fakeCenter)
    if (sub.operator?.id !== prevOperatorId) {
      collectedLabels.push({
        name: sub.operator?.title,
        longitude: pointOnLine.geometry.coordinates[0],
        latitude: pointOnLine.geometry.coordinates[1],
        color: lineColor,
      })
    }

    prevOperatorId = sub.operator?.id
  })

  return (
    <BaseMap
      initialViewState={{ bounds: bbox, fitBoundsOptions: { padding: 80 } }}
      dots={[]}
      id="preview"
    >
      <Source key="lines" type="geojson" data={featureCollection(collectedLines)}>
        <Layer
          type="line"
          paint={{
            "line-width": 4,
            "line-color": ["get", "color"],
            "line-opacity": 0.9,
          }}
        />
      </Source>

      {collectedLabels.map(({ name, longitude, latitude, color }) => {
        if (!latitude || !longitude) return null
        return (
          <Marker key={name} longitude={longitude} latitude={latitude} anchor="center">
            <span
              className="rounded py-0 px-1"
              style={{
                backgroundColor: color,
                color: layerColors.selectable === color ? "white" : "black",
              }}
            >
              {name}
            </span>
          </Marker>
        )
      })}

      {responsePoint && (
        <Marker longitude={responsePoint.lng} latitude={responsePoint.lat} anchor="bottom">
          <MapPinIcon className="h-6 w-6 text-red-500" />
        </Marker>
      )}
    </BaseMap>
  )
}
