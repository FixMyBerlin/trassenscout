import { Routes } from "@blitzjs/next"
import { lineString } from "@turf/helpers"
import { bbox, featureCollection } from "@turf/turf"
import { useRouter } from "next/router"
import React, { useState } from "react"
import { LngLatBoundsLike, MapLayerMouseEvent, Marker } from "react-map-gl"

import { useSlugs } from "src/core/hooks"
import { Subsection } from "src/pages/[projectSlug]/[sectionSlug]/[...subsectionPath]"
import { BaseMap } from "./BaseMap"
import { TipMarker } from "./TipMarker"
import { SubsubsectionLabel } from "./Labels"
import { ProjectMapSections } from "./ProjectMap"
import { midPoint } from "./utils"
import { lineColors } from "./lineColors"

type SubsectionMapProps = {
  sections: ProjectMapSections
  selectedSubsection: Subsection
}

export const SubsectionMap: React.FC<SubsectionMapProps> = ({ sections, selectedSubsection }) => {
  const { projectSlug, sectionSlug, subsectionSlug, subsubsectionSlug } = useSlugs()

  const router = useRouter()

  const selectableSubsubsections = selectedSubsection.subsubsections.filter(
    (sec) => sec.geometry !== null
  )

  const handleSelect = (slug: string | null) => {
    void router.push(
      Routes.SubsectionDashboardPage({
        projectSlug: projectSlug!,
        sectionSlug: sectionSlug!,
        subsectionPath: slug ? [subsectionSlug!, slug] : [subsectionSlug!],
      }),
      undefined,
      { scroll: false }
    )
  }

  const [hovered, setHovered] = useState<string | number | null>(null)
  const getId = (e: MapLayerMouseEvent | undefined) => e?.features?.[0]?.properties?.id || null
  const handleClick = async (e: MapLayerMouseEvent | undefined) =>
    getId(e) && handleSelect(getId(e))
  const handleMouseEnter = (e: MapLayerMouseEvent | undefined) => setHovered(getId(e))
  const handleMouseLeave = () => setHovered(null)

  const [minX, minY, maxX, maxY] = bbox(lineString(selectedSubsection.geometry))
  const sectionBounds: LngLatBoundsLike = [minX, minY, maxX, maxY]

  const lines = featureCollection(
    sections
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
    selectableSubsubsections.map((sec) =>
      lineString(sec.geometry, {
        id: sec.slug,
        color:
          sec.slug === subsubsectionSlug
            ? lineColors.selected
            : sec.slug === hovered
            ? lineColors.hovered
            : lineColors.selectable,
      })
    )
  )

  const dots = selectableSubsubsections.map((sec) => [sec.geometry[0], sec.geometry.at(-1)]).flat()

  const markers = selectableSubsubsections.map((sec, index) => {
    const [longitude, latitude] = midPoint(sec.geometry)
    return (
      <Marker
        key={sec.id}
        longitude={longitude}
        latitude={latitude}
        anchor="center"
        onClick={async () => handleSelect(sec.slug)}
      >
        <TipMarker anchor="top">
          <div className="p-2">
            <SubsubsectionLabel
              label={`RF${index + 1}`}
              onMouseEnter={() => setHovered(sec.slug)}
              onMouseLeave={() => setHovered(null)}
            />
          </div>
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
      lines={lines}
      selectableLines={selectableLines}
      // @ts-ignore
      dots={dots.length ? lineString(dots) : undefined}
    >
      {markers}
    </BaseMap>
  )
}
