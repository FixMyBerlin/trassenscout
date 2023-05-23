import { Routes } from "@blitzjs/next"
import { lineString, point } from "@turf/helpers"
import { bbox, featureCollection } from "@turf/turf"
import { useRouter } from "next/router"
import React, { useState } from "react"
import { LngLatBoundsLike, MapLayerMouseEvent, Marker } from "react-map-gl"
import { useSlugs } from "src/core/hooks"
import { SectionWithSubsectionsWithPosition } from "src/sections/queries/getSectionsIncludeSubsections"
import { SubsectionWithSubsubsectionsWithPosition } from "src/subsections/queries/getSubsectionIncludeSubsubsections"
import { BaseMap } from "./BaseMap"
import { TitleLabel } from "./Labels"
import { SubsubsectionMapIcon } from "./Icons"
import { TipMarker } from "./TipMarker"
import { lineColors } from "./lineColors"
import { midPoint } from "./utils"
import { shortTitle } from "../text"

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
        section.subsections
          .map((subsection) =>
            lineString(subsection.geometry, {
              color: lineColors.unselectable,
            })
          )
          .filter(Boolean)
      )
      .flat()
  )

  const selectableLines = featureCollection(
    selectedSubsection.subsubsections
      .map(
        (sec) =>
          sec.type === "ROUTE" &&
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
      .filter(Boolean)
  )

  const selectablePoints = featureCollection(
    selectedSubsection.subsubsections
      .map(
        (sec) =>
          sec.type === "AREA" &&
          point(sec.geometry, {
            id: sec.slug,
            color:
              sec.slug === subsubsectionSlug
                ? lineColors.selected
                : sec.slug === hovered
                ? lineColors.hovered
                : lineColors.selectable,
          })
      )
      .filter(Boolean)
  )

  // Dots are only for Subsubsections of type ROUTE
  const dotsGeoms = selectedSubsection.subsubsections
    .map((sec) => sec.type === "ROUTE" && [(sec.geometry[0], sec.geometry.at(-1))])
    .flat()
    .filter(Boolean)

  const markers = selectedSubsection.subsubsections.map((sec) => {
    const [longitude, latitude] = sec.type === "ROUTE" ? midPoint(sec.geometry) : sec.geometry
    return (
      <Marker
        key={sec.id}
        longitude={longitude}
        latitude={latitude}
        anchor="center"
        onClick={(e) => handleSelect(sec.slug, e.originalEvent.ctrlKey)}
      >
        <TipMarker
          anchor={sec.labelPos || "top"}
          onMouseEnter={() => setHovered(sec.slug)}
          onMouseLeave={() => setHovered(null)}
        >
          <TitleLabel
            icon={<SubsubsectionMapIcon label={shortTitle(sec.slug)} />}
            title={sec.subTitle}
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
      lines={lines}
      selectableLines={selectableLines}
      selectablePoints={selectablePoints}
      dots={dotsGeoms}
    >
      {markers}
    </BaseMap>
  )
}
