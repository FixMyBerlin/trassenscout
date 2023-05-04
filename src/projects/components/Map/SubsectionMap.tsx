import React, { useState } from "react"
import { useRouter } from "next/router"
import { Routes } from "@blitzjs/next"
import { LngLatBoundsLike, Marker } from "react-map-gl"
import { lineString } from "@turf/helpers"
import { bbox, featureCollection } from "@turf/turf"

import { useSlugs } from "src/core/hooks"
import { midPoint } from "./utils"
import { BaseMap } from "./BaseMap"
import { SubsubsectionMarker } from "./Markers"
import { ProjectMapSections } from "./ProjectMap"
import { Subsection } from "src/pages/[projectSlug]/[sectionSlug]/[...subsectionPath]"

type SubsectionMapProps = {
  sections: ProjectMapSections
  selectedSection: Subsection
}

const unselectableLineColor = "#979797"
const lineColor = "#EAB308"
const hoveredColor = "#fad57d"

export const SubsectionMap: React.FC<SubsectionMapProps> = ({ sections, selectedSection }) => {
  const { projectSlug, sectionSlug, subsectionSlug } = useSlugs()

  const router = useRouter()
  const [hovered, setHovered] = useState<number | null>(null)

  const selectableSections = selectedSection.subsubsections.filter((sec) => sec.geometry !== null)

  const handleSelect = (slug: string | null) => {
    void router.push(
      Routes.SubsectionDashboardPage({
        projectSlug: projectSlug!,
        sectionSlug: sectionSlug!,
        subsectionPath: slug ? [subsectionSlug!, slug] : [subsectionSlug!]
      }),
      undefined,
      { scroll: false }
    )
  }

  const handleClick = async (e: mapboxgl.MapLayerMouseEvent) => {
    if (!e.features?.length) handleSelect(null)
    const slug = e.features?.[0]?.properties?.slug
    if (!slug) handleSelect(null)
    handleSelect(slug)
  }

  const handleMouseEnter = (e: mapboxgl.MapLayerMouseEvent) =>
    setHovered(e?.features?.[0]?.properties?.id || null)

  const handleMouseLeave = () => setHovered(null)

  const [minX, minY, maxX, maxY] = bbox(lineString(selectedSection.geometry))
  const sectionBounds: LngLatBoundsLike = [minX, minY, maxX, maxY]

  const lines = featureCollection(
    sections
      .map((section) =>
        section.subsections.map((subsection) =>
          lineString(JSON.parse(subsection.geometry), {
            color: unselectableLineColor,
            opacity: subsection.id === selectedSection.id ? 1 : 0.5,
          })
        )
      )
      .flat()
  )

  const selectableLines = featureCollection(
    selectableSections.map((sec) =>
      lineString(sec.geometry, {
        id: sec.id,
        slug: sec.slug,
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
    const [longitude, latitude] = midPoint(sec.geometry)
    return (
      <Marker
        key={sec.id}
        longitude={longitude}
        latitude={latitude}
        anchor="center"
        onClick={async () => handleSelect(sec.slug)}
      >
        <SubsubsectionMarker label={`RF${index + 1}`} />
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
      lines={lines}
      selectableLines={selectableLines}
      // @ts-ignore
      dots={dotsFeature}
    >
      {markers}
    </BaseMap>
  )
}
