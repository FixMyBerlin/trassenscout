import React, { useState } from "react"
import { useRouter } from "next/router"
import { Routes, useParam } from "@blitzjs/next"
import { Section, Subsection } from "@prisma/client"
import { lineString } from "@turf/helpers"
import { along, featureCollection, length } from "@turf/turf"
import { MapLayerMouseEvent, Marker } from "react-map-gl"

import { sectionsBbox } from "./utils"
import { BaseMap } from "./BaseMap"
import { TipMarker } from "./TipMarker"
import { SectionLabel, StartEnd } from "./Labels"
import { lineColors } from "./lineColors"

export type ProjectMapSections = (Section & {
  subsections: Pick<Subsection, "id" | "slug" | "geometry">[]
})[]

type ProjectMapProps = {
  children?: React.ReactNode
  sections: ProjectMapSections
}

export const ProjectMap: React.FC<ProjectMapProps> = ({ sections }) => {
  const router = useRouter()
  const projectSlug = useParam("projectSlug", "string")

  const handleSelect = (sectionSlug: string) =>
    router.push(Routes.SectionDashboardPage({ projectSlug: projectSlug!, sectionSlug }))

  const [hovered, setHovered] = useState<number | string | null>(null)
  const getId = (e: MapLayerMouseEvent | undefined) => e?.features?.[0]?.properties?.id || null
  const handleClick = async (e: MapLayerMouseEvent | undefined) =>
    getId(e) && handleSelect(getId(e))
  const handleMouseEnter = (e: MapLayerMouseEvent | undefined) => setHovered(getId(e))
  const handleMouseLeave = () => setHovered(null)

  const sectionBounds = sectionsBbox(sections)
  if (!sectionBounds) return null

  const dots = sections
    .map((section) => {
      const first = section.subsections[0]
      if (!first) {
        return []
      } else {
        return [
          JSON.parse(first.geometry)[0],
          JSON.parse(section.subsections.at(-1)!.geometry).at(-1),
        ]
      }
    })
    .flat()

  const selectableLines = featureCollection(
    sections
      .map((section) =>
        section.subsections.map((subsection) =>
          lineString(JSON.parse(subsection.geometry), {
            id: section.slug,
            color: hovered === section.slug ? lineColors.hovered : lineColors.selectable,
          })
        )
      )
      .flat()
  )

  const markers = sections.map((section, index) => {
    const midIndex = Math.floor(section.subsections.length / 2)
    const geometryString = section.subsections?.at(midIndex)?.geometry
    if (!section.subsections.length || !midIndex || !geometryString) {
      return null
    }
    const midLine = lineString(JSON.parse(geometryString))
    const midLengthHalf = length(midLine) / 2
    const midPoint = along(midLine, midLengthHalf)

    return (
      <Marker
        key={section.id}
        longitude={midPoint.geometry.coordinates[0]}
        latitude={midPoint.geometry.coordinates[1]}
        anchor="center"
        onClick={() =>
          router.push(
            Routes.SectionDashboardPage({ projectSlug: projectSlug!, sectionSlug: section.slug })
          )
        }
      >
        <TipMarker
          anchor="top"
          onMouseEnter={() => setHovered(section.slug)}
          onMouseLeave={() => setHovered(null)}
        >
          <StartEnd
            icon={<SectionLabel label={`TS${index + 1}`} />}
            start={section.start}
            end={section.end}
          />
        </TipMarker>
      </Marker>
    )
  })

  return (
    <BaseMap
      id="mainMap"
      initialViewState={{
        bounds: sectionBounds,
        fitBoundsOptions: { padding: 60 },
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      selectableLines={selectableLines}
      dots={dots.length ? lineString(dots) : undefined}
    >
      {markers}
    </BaseMap>
  )
}
