import { Routes } from "@blitzjs/next"
import { lineString, point } from "@turf/helpers"
import { bbox, featureCollection } from "@turf/turf"
import { useRouter } from "next/router"
import React, { useState } from "react"
import { LngLatBoundsLike, MapLayerMouseEvent, MapboxEvent, Marker } from "react-map-gl"
import { useSlugs } from "src/core/hooks"
import { SubsectionWithPosition } from "src/subsections/queries/getSubsection"
import { SubsubsectionWithPosition } from "src/subsubsections/queries/getSubsubsection"
import { shortTitle } from "../text"
import { BaseMap } from "./BaseMap"
import { SubsubsectionMapIcon } from "./Icons"
import { TitleLabel } from "./Labels"
import { TipMarker } from "./TipMarker"
import { lineColors } from "./lineColors"
import { midPoint } from "./utils"

type Props = {
  subsections: SubsectionWithPosition[]
  selectedSubsection: SubsectionWithPosition
  subsubsections: SubsubsectionWithPosition[]
}

export const SubsectionSubsubsectionMap: React.FC<Props> = ({
  subsections,
  selectedSubsection,
  subsubsections,
}) => {
  const {
    projectSlug,
    subsectionSlug: pageSubsectionSlug, // we use this name a lot, so `page*` is to clarify
    subsubsectionSlug: pageSubsubsectionSlug,
  } = useSlugs()
  const router = useRouter()

  type HandleSelectProps = { subsectionSlug: string; subsubsectionSlug: string; edit: boolean }
  const handleSelect = ({ subsectionSlug, subsubsectionSlug, edit }: HandleSelectProps) => {
    if (!projectSlug) return
    let url = subsubsectionSlug
      ? Routes.SubsubsectionDashboardPage({ projectSlug, subsectionSlug, subsubsectionSlug })
      : Routes.SubsectionDashboardPage({ projectSlug, subsectionSlug })

    // alt+click
    if (edit) {
      url = subsubsectionSlug
        ? Routes.EditSubsubsectionPage({ projectSlug, subsectionSlug, subsubsectionSlug })
        : Routes.EditSubsectionPage({ projectSlug, subsectionSlug })
    }

    void router.push(url, undefined, { scroll: edit ? true : false })
  }

  const handleClickMap = (e: MapLayerMouseEvent) => {
    const subsectionSlug = e.features?.at(0)?.properties?.subsectionSlug
    const subsubsectionSlug = e.features?.at(0)?.properties?.subsubsectionSlug
    if (subsectionSlug && subsubsectionSlug) {
      handleSelect({ subsectionSlug, subsubsectionSlug, edit: e.originalEvent?.altKey })
    }
  }

  const [hovered, setHovered] = useState<string | number | null>(null)
  const handleMouseEnter = (e: MapLayerMouseEvent) => {
    setHovered(e.features?.at(0)?.properties?.id || null)
  }
  const handleMouseLeave = () => {
    setHovered(null)
  }

  const [minX, minY, maxX, maxY] = bbox(lineString(selectedSubsection.geometry))
  const sectionBounds: LngLatBoundsLike = [minX, minY, maxX, maxY]

  const lines = featureCollection(
    subsections
      .map((subsection) =>
        lineString(subsection.geometry, {
          // TODO: Clarify style for selected section
          color:
            subsection.slug === selectedSubsection.slug
              ? lineColors.selected
              : lineColors.unselectable,
          width: 17,
          opacity: subsection.slug === selectedSubsection.slug ? 0.4 : 0.35,
        })
      )
      .filter(Boolean)
  )

  const selectableLines = featureCollection(
    subsubsections
      .map(
        (sec) =>
          sec.type === "ROUTE" &&
          lineString(sec.geometry, {
            subsectionSlug: sec.subsection.slug,
            subsubsectionSlug: sec.slug,
            color:
              sec.slug === pageSubsubsectionSlug
                ? lineColors.selected
                : sec.slug === hovered
                ? lineColors.hovered
                : lineColors.selectable,
          })
      )
      .filter(Boolean)
  )

  const selectablePoints = featureCollection(
    subsubsections
      .map(
        (sec) =>
          sec.type === "AREA" &&
          point(sec.geometry, {
            subsectionSlug: sec.subsection.slug,
            subsubsectionSlug: sec.slug,
            color:
              sec.slug === pageSubsubsectionSlug
                ? lineColors.selected
                : sec.slug === hovered
                ? lineColors.hovered
                : lineColors.selectable,
          })
      )
      .filter(Boolean)
  )

  // Dots are only for Subsubsections of type ROUTE
  const dotsGeoms = subsubsections
    .map((sec) => sec.type === "ROUTE" && [(sec.geometry[0], sec.geometry.at(-1))])
    .flat()
    .filter(Boolean)

  const markers = subsubsections.map((sec) => {
    const [longitude, latitude] = sec.type === "ROUTE" ? midPoint(sec.geometry) : sec.geometry
    return (
      <Marker
        key={sec.id}
        longitude={longitude}
        latitude={latitude}
        anchor="center"
        onClick={(e) => {
          handleSelect({
            subsectionSlug: sec.subsection.slug,
            subsubsectionSlug: sec.slug,
            edit: e.originalEvent.altKey,
          })
        }}
      >
        <TipMarker
          anchor={sec.labelPos || "top"}
          onMouseEnter={() => setHovered(sec.slug)}
          onMouseLeave={() => setHovered(null)}
          className={
            // We display all subsubsections, but those of other subsections are faded out
            sec.subsection.slug === pageSubsectionSlug
              ? "opacity-100"
              : "opacity-50 hover:opacity-100"
          }
        >
          <TitleLabel
            icon={<SubsubsectionMapIcon label={shortTitle(sec.slug)} />}
            title={sec.subTitle}
            subtitle={sec.task}
          />
        </TipMarker>
      </Marker>
    )
  })

  return (
    <>
      <BaseMap
        id="mainMap"
        initialViewState={{
          bounds: sectionBounds,
          fitBoundsOptions: { padding: 60 },
        }}
        onClick={handleClickMap}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        lines={lines}
        selectableLines={selectableLines}
        selectablePoints={selectablePoints}
        dots={dotsGeoms}
      >
        {markers}
      </BaseMap>
      <p className="mt-2 text-right text-xs text-gray-400">
        Schnellzugriff zum Bearbeitne über option+click (Mac) / alt+click (Windows)
      </p>
    </>
  )
}
