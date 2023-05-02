import React, { useState } from "react"
import { FeatureCollection } from "geojson"
import { lineString } from "@turf/helpers"
import { bbox, featureCollection } from "@turf/turf"
import { Layer, LngLatBoundsLike, Marker, Source } from "react-map-gl"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

import { midPoint } from "./utils"
import { BaseMap } from "./BaseMap"
import { SubsubsectionMarker } from "./Markers"
import { ProjectMapSections } from "./ProjectMap"
import { Subsection } from "src/pages/[projectSlug]/[sectionSlug]/[subsectionSlug]"

type SubsectionMapProps = {
  sections: ProjectMapSections
  selectedSection: Subsection
}

const unselectableLineColor = "#979797"
const lineColor = "#EAB308"
const hoveredColor = "#fad57d"

export const SubsectionMap: React.FC<SubsectionMapProps> = ({ sections, selectedSection }) => {
  const [hovered, setHovered] = useState<number | null>(null)

  const selectableSections = selectedSection.subsubsections

  const select = (id: number) => {
    console.log("selected subsubsection:", id)
  }

  const handleClick = async (e: mapboxgl.MapLayerMouseEvent | undefined) => {
    const id = e?.features?.[0]?.properties?.id
    if (!id) return
    select(id)
  }

  const handleMouseEnter = (e: mapboxgl.MapLayerMouseEvent) =>
    setHovered(e?.features?.[0]?.properties?.id || null)

  const handleMouseLeave = () => setHovered(null)

  const [minX, minY, maxX, maxY] = bbox(lineString(selectedSection.geometry))
  const sectionBounds: LngLatBoundsLike = [minX, minY, maxX, maxY]

  const features = featureCollection([
    lineString(selectedSection.geometry, { color: unselectableLineColor }),
  ])

  const selectableFeatures = featureCollection(
    selectableSections.map((sec) =>
      lineString(sec.geometry, {
        id: sec.id,
        color: sec.id === hovered ? hoveredColor : lineColor,
      })
    )
  )

  let dots = null
  if (selectableSections.length) {
    dots = selectableSections.map((sec) => [sec.geometry[0], sec.geometry.at(-1)]).flat()
  }
  // @ts-ignore
  const dotsFeature = dots ? lineString(dots) : null

  const markers = selectableSections.map((sec, index) => {
    const [longitude, latitude] = midPoint(sec.geometry).geometry.coordinates
    return (
      <Marker
        key={sec.id}
        longitude={longitude}
        latitude={latitude}
        anchor="center"
        onClick={() => select(sec.id)}
      >
        <SubsubsectionMarker isInteractive label={`RF${index + 1}`} />
      </Marker>
    )
  })

  return (
    <BaseMap
      id="mainMap"
      mapLib={maplibregl}
      initialViewState={{
        bounds: sectionBounds,
        fitBoundsOptions: { padding: 60 },
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      isInteractive={true}
      features={features}
      selectableFeatures={selectableFeatures}
      // @ts-ignore
      dots={dotsFeature}
    >
      {markers}
    </BaseMap>
  )
}
