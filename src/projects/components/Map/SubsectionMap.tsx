import { Routes } from "@blitzjs/next"
import { lineString } from "@turf/helpers"
import { bbox, featureCollection } from "@turf/turf"
import { useRouter } from "next/router"
import React, { useState } from "react"
import { LngLatBoundsLike, MapLayerMouseEvent, Marker } from "react-map-gl"
import { useSlugs } from "src/core/hooks"
import { SectionWithSubsectionsWithPosition } from "src/sections/queries/getSectionsIncludeSubsections"
import { SubsectionWithSubsubsectionsWithPosition } from "src/subsections/queries/getSubsectionIncludeSubsubsections"
import { BaseMap } from "./BaseMap"
import { SubsubsectionLabel } from "./Labels"
import { TipMarker } from "./TipMarker"
import { lineColors } from "./lineColors"
import { midPoint } from "./utils"

type Props = {
  sections: SectionWithSubsectionsWithPosition[]
  selectedSubsection: SubsectionWithSubsubsectionsWithPosition
}

export const SubsectionMap: React.FC<Props> = ({ sections, selectedSubsection }) => {
  const { projectSlug, sectionSlug, subsectionSlug, subsubsectionSlug } = useSlugs()

  const router = useRouter()

  const handleSelect = (slug: string | null, edit: boolean) => {
    if (slug && edit) {
      void router.push(
        Routes.EditSubsubsectionPage({
          projectSlug: projectSlug!,
          sectionSlug: sectionSlug!,
          subsectionSlug: subsectionSlug!,
          subsubsectionSlug: slug,
        })
      )
    } else {
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
  }

  const [hovered, setHovered] = useState<string | number | null>(null)
  const getId = (e: MapLayerMouseEvent | undefined) => e?.features?.[0]?.properties?.id || null
  const handleClick = async (e: MapLayerMouseEvent | undefined) =>
    getId(e) && handleSelect(getId(e), e!.originalEvent.ctrlKey)
  const handleMouseEnter = (e: MapLayerMouseEvent | undefined) => setHovered(getId(e))
  const handleMouseLeave = () => setHovered(null)

  const [minX, minY, maxX, maxY] = bbox(lineString(selectedSubsection.geometry))
  const sectionBounds: LngLatBoundsLike = [minX, minY, maxX, maxY]

  const lines = featureCollection(
    sections
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
    selectedSubsection.subsubsections.map((sec) =>
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

  const dotsGeoms = selectedSubsection.subsubsections
    .map((sec) => [sec.geometry[0], sec.geometry.at(-1)])
    .flat()
    .filter(Boolean)

  const markers = selectedSubsection.subsubsections.map((sec, index) => {
    const [longitude, latitude] = midPoint(sec.geometry)
    return (
      <Marker
        key={sec.id}
        longitude={longitude}
        latitude={latitude}
        anchor="center"
        onClick={(e) => handleSelect(sec.slug, e.originalEvent.ctrlKey)}
      >
        <TipMarker anchor={sec.labelPos || "top"}>
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
      dots={dotsGeoms}
    >
      {markers}
    </BaseMap>
  )
}
