import React, { useState } from "react"
import { useRouter } from "next/router"
import { Routes, useParam } from "@blitzjs/next"
import { featureCollection } from "@turf/turf"
import { lineString } from "@turf/helpers"
import { MapLayerMouseEvent, Marker } from "react-map-gl"

import { midPoint, sectionsBbox } from "./utils"
import { BaseMap } from "./BaseMap"
import { TipMarker } from "./TipMarker"
import { StartEnd, SubsectionLabel } from "./Labels"
import { ProjectMapSections } from "./ProjectMap"
import { lineColors } from "./lineColors"

type SectionMapProps = {
  children?: React.ReactNode
  sections: ProjectMapSections
  selectedSection: ProjectMapSections[number]
}

export const SectionMap: React.FC<SectionMapProps> = ({ sections, selectedSection }) => {
  const router = useRouter()
  const projectSlug = useParam("projectSlug", "string")
  const sectionSlug = useParam("sectionSlug", "string")

  const handleSelect = (subsectionSlug: string) =>
    router.push(
      Routes.SubsectionDashboardPage({
        projectSlug: projectSlug!,
        sectionSlug: sectionSlug!,
        subsectionPath: [subsectionSlug],
      })
    )

  const [hovered, setHovered] = useState<number | string | null>(null)
  const getId = (e: MapLayerMouseEvent | undefined) => e?.features?.[0]?.properties?.id || null
  const handleClick = async (e: MapLayerMouseEvent | undefined) =>
    getId(e) && handleSelect(getId(e))
  const handleMouseEnter = (e: MapLayerMouseEvent | undefined) => setHovered(getId(e))
  const handleMouseLeave = () => setHovered(null)

  const sectionBounds = sectionsBbox([selectedSection])
  if (!sectionBounds) return null

  const dots = selectedSection.subsections
    .map((subsection) => {
      const geometry = JSON.parse(subsection.geometry)
      return [geometry[0], geometry.at(-1)]
    })
    .flat()

  const lines = featureCollection(
    sections
      .filter((section) => section.id !== selectedSection.id)
      .map((section) =>
        section.subsections.map((subsection) =>
          lineString(JSON.parse(subsection.geometry), {
            color: lineColors.unselectable,
          })
        )
      )
      .flat()
  )

  const selectableLines = featureCollection(
    selectedSection.subsections.map((subsection) =>
      lineString(JSON.parse(subsection.geometry), {
        id: subsection.slug,
        color: subsection.slug === hovered ? lineColors.hovered : lineColors.selectable,
      })
    )
  )

  const markers = selectedSection.subsections.map((subsection, index) => {
    const [longitude, latitude] = midPoint(JSON.parse(subsection.geometry))
    return (
      <Marker
        key={subsection.id}
        longitude={longitude}
        latitude={latitude}
        anchor="center"
        onClick={() => handleSelect(subsection.slug)}
      >
        <TipMarker
          anchor={subsection.labelPos || "top"}
          onMouseEnter={() => setHovered(subsection.slug)}
          onMouseLeave={() => setHovered(null)}
        >
          <StartEnd
            icon={<SubsectionLabel label={`PA${index + 1}`} />}
            start={subsection.start}
            end={subsection.end}
          />
        </TipMarker>
      </Marker>
    )
  })

  return (
    <section className="mt-12 flex h-96 w-full gap-4 sm:h-[500px]">
      <BaseMap
        id="mainMap"
        initialViewState={{
          bounds: sectionBounds,
          fitBoundsOptions: { padding: 60 },
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        lines={lines}
        selectableLines={selectableLines}
        dots={dots.length ? lineString(dots) : undefined}
      >
        {markers}
      </BaseMap>
    </section>
  )
}
