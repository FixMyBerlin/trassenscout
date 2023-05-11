import { Routes, useParam } from "@blitzjs/next"
import { lineString } from "@turf/helpers"
import { featureCollection } from "@turf/turf"
import { useRouter } from "next/router"
import React, { useState } from "react"
import { MapLayerMouseEvent, Marker } from "react-map-gl"
import { SectionWithSubsectionsWithPosition } from "src/sections/queries/getSectionsIncludeSubsections"
import { BaseMap } from "./BaseMap"
import { StartEnd, SubsectionLabel } from "./Labels"
import { TipMarker } from "./TipMarker"
import { lineColors } from "./lineColors"
import { midPoint, sectionsBbox } from "./utils"

type Props = {
  children?: React.ReactNode
  sections: SectionWithSubsectionsWithPosition[]
  selectedSection: SectionWithSubsectionsWithPosition | undefined
}

export const SectionMap: React.FC<Props> = ({ sections, selectedSection }) => {
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

  // Guard so Typescript is happy afterward
  if (!selectedSection?.subsections) return null

  const dotGeoms = selectedSection.subsections
    .map((s) => [s.geometry[0], s.geometry.at(-1)])
    .flat()
    .filter(Boolean)

  const lines = featureCollection(
    sections
      .filter((section) => section.id !== selectedSection.id)
      .map((section) =>
        section.subsections.map((subsection) =>
          lineString(subsection.geometry, {
            color: lineColors.unselectable,
          })
        )
      )
      .flat()
  )

  const selectableLines = featureCollection(
    selectedSection.subsections.map((subsection) =>
      lineString(subsection.geometry, {
        id: subsection.slug,
        color: subsection.slug === hovered ? lineColors.hovered : lineColors.selectable,
      })
    )
  )

  const markers = selectedSection.subsections.map((subsection, index) => {
    const [longitude, latitude] = midPoint(subsection.geometry)
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
          bounds: sectionsBbox([selectedSection]),
          fitBoundsOptions: { padding: 60 },
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        lines={lines}
        selectableLines={selectableLines}
        dots={dotGeoms}
      >
        {markers}
      </BaseMap>
    </section>
  )
}
