import { Routes, useParam } from "@blitzjs/next"
import { lineString } from "@turf/helpers"
import { along, featureCollection, length } from "@turf/turf"
import { useRouter } from "next/router"
import React, { useState } from "react"
import { MapLayerMouseEvent, Marker } from "react-map-gl"
import { SectionWithSubsectionsWithPosition } from "src/sections/queries/getSectionsIncludeSubsections"
import { BaseMap } from "./BaseMap"
import { StartEndLabel } from "./Labels"
import { SectionMapIcon } from "./Icons"
import { TipMarker } from "./TipMarker"
import { lineColors } from "./lineColors"
import { sectionsBbox } from "./utils"

type Props = { sections: SectionWithSubsectionsWithPosition[] }

export const ProjectMap: React.FC<Props> = ({ sections }) => {
  const router = useRouter()
  const projectSlug = useParam("projectSlug", "string")

  const handleSelect = (sectionSlug: string, edit: boolean) => {
    if (edit) {
      void router.push(Routes.EditSectionPage({ projectSlug: projectSlug!, sectionSlug }))
    } else {
      void router.push(Routes.SectionDashboardPage({ projectSlug: projectSlug!, sectionSlug }))
    }
  }

  const [hovered, setHovered] = useState<number | string | null>(null)
  const getId = (e: MapLayerMouseEvent | undefined) => e?.features?.[0]?.properties?.id || null
  const handleClick = async (e: MapLayerMouseEvent | undefined) =>
    getId(e) && handleSelect(getId(e), e!.originalEvent.ctrlKey)
  const handleMouseEnter = (e: MapLayerMouseEvent | undefined) => setHovered(getId(e))
  const handleMouseLeave = () => setHovered(null)

  const dotsGeoms = sections
    .map((section) => {
      const first = section.subsections[0]
      if (!first) {
        return []
      } else {
        return [first.geometry[0], section.subsections.at(-1)!.geometry.at(-1)]
      }
    })
    .flat()
    .filter(Boolean)

  const selectableLines = featureCollection(
    sections
      .map((section) =>
        section.subsections.map((subsection) =>
          lineString(subsection.geometry, {
            id: section.slug,
            color: hovered === section.slug ? lineColors.hovered : lineColors.selectable,
          })
        )
      )
      .flat()
  )

  const markers = sections.map((section) => {
    const midIndex = Math.floor(section.subsections.length / 2)
    const geometryString = section.subsections?.at(midIndex)?.geometry
    if (!section.subsections.length || !midIndex || !geometryString) {
      return null
    }
    const midLine = lineString(geometryString)
    const midLengthHalf = length(midLine) / 2
    const midPoint = along(midLine, midLengthHalf)

    return (
      <Marker
        key={section.id}
        longitude={midPoint.geometry.coordinates[0]}
        latitude={midPoint.geometry.coordinates[1]}
        anchor="center"
        onClick={(e) => handleSelect(section.slug, e.originalEvent.ctrlKey)}
      >
        <TipMarker
          anchor={section.labelPos || "top"}
          onMouseEnter={() => setHovered(section.slug)}
          onMouseLeave={() => setHovered(null)}
        >
          <StartEndLabel
            icon={<SectionMapIcon label={`TS${section.id}`} />}
            start={section.start}
            end={section.end}
          />
        </TipMarker>
      </Marker>
    )
  })

  return (
    <section className="mt-12">
      <BaseMap
        id="mainMap"
        initialViewState={{
          bounds: sectionsBbox(sections),
          fitBoundsOptions: { padding: 60 },
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        selectableLines={selectableLines}
        dots={dotsGeoms}
      >
        {markers}
      </BaseMap>
    </section>
  )
}
