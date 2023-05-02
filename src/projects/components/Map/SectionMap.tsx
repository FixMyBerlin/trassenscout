import React, { useState } from "react"
import { useRouter } from "next/router"
import { Routes, useParam } from "@blitzjs/next"
import { Section } from "@prisma/client"
import { lineString } from "@turf/helpers"
import { Layer, Marker, Source } from "react-map-gl"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

import { midPoint, sectionsBbox } from "./utils"
import { BaseMap } from "./BaseMap"
import { SubsectionMarker } from "./Markers"
import { ProjectMapSections } from "./ProjectMap"

type SectionMapProps = {
  children?: React.ReactNode
  isInteractive: boolean
  sections: ProjectMapSections
  selectedSection: ProjectMapSections[number]
}

export const SectionMap: React.FC<SectionMapProps> = ({
  sections,
  isInteractive,
  selectedSection,
}) => {
  const router = useRouter()
  const projectSlug = useParam("projectSlug", "string")

  const [hoveredSectionIds, setHoveredSectionIds] = useState<number[]>([])

  const handleClick = async (e: mapboxgl.MapLayerMouseEvent) => {
    if (!isInteractive) return
    const { sectionSlug, subsectionSlug } = e.features![0]!.properties!
    await router.push(
      Routes.SubsectionDashboardPage({
        projectSlug: projectSlug!,
        sectionSlug: sectionSlug,
        subsectionSlug: subsectionSlug,
      })
    )
  }

  const handleMouseEnter = (e: mapboxgl.MapLayerMouseEvent) => {
    if (!isInteractive) return
    setHoveredSectionIds(e.features!.map((f) => f?.properties?.sectionId))
  }

  const handleMouseLeave = () => {
    if (!isInteractive) return
    setHoveredSectionIds([])
  }

  const interactiveLayerIds = sections
    .map((s) => s.subsections.map((ss) => `layer_${ss.id}`))
    .flat()

  const sectionBounds = sectionsBbox(selectedSection ? [selectedSection] : sections)
  if (!sectionBounds) return null

  // Layer style for segments depending on selected section and segment
  const getLineColor = ({ section }: { section: Section }) => {
    let lineColor = "#979797"
    if (hoveredSectionIds.includes(section.id)) lineColor = "#EAB308"
    if (selectedSection && section.id === selectedSection.id) lineColor = "#EAB308"
    return lineColor
  }

  const dots = selectedSection.subsections.map((subsection) => JSON.parse(subsection.geometry)[0])
  dots.push(JSON.parse(selectedSection.subsections.at(-1)!.geometry).at(-1))

  const lines = sections.map((section) =>
    section.subsections.map((subsection) => (
      <>
        <Source
          key={subsection.id}
          type="geojson"
          data={lineString(JSON.parse(subsection.geometry), {
            sectionId: section.id,
            sectionSlug: section.slug,
            subsectionId: subsection.id,
            subsectionSlug: subsection.slug,
          })}
        >
          <Layer
            id={`layer_${subsection.id}`}
            type="line"
            paint={{
              "line-width": 7,
              "line-color": getLineColor({ section }),
              "line-color-transition": { duration: 0 },
            }}
          />
        </Source>
      </>
    ))
  )

  const markers = selectedSection.subsections.map((subsection, index) => {
    const [longitude, latitude] = midPoint(JSON.parse(subsection.geometry)).geometry.coordinates
    return (
      <Marker
        key={subsection.id}
        longitude={longitude}
        latitude={latitude}
        anchor="center"
        onClick={() =>
          isInteractive &&
          router.push(
            Routes.SubsectionDashboardPage({
              projectSlug: projectSlug!,
              sectionSlug: selectedSection.slug,
              subsectionSlug: subsection.slug,
            })
          )
        }
      >
        <SubsectionMarker isInteractive={isInteractive} label={`PA${index + 1}`} />
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
      isInteractive={isInteractive}
      interactiveLayerIds={interactiveLayerIds}
      // @ts-ignore
      dots={lineString(dots)}
    >
      {lines}
      {markers}
    </BaseMap>
  )
}
