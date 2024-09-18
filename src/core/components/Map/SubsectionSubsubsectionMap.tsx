import { useSlugs } from "@/src/core/hooks"
import { SubsectionWithPosition } from "@/src/subsections/queries/getSubsection"
import { SubsubsectionWithPosition } from "@/src/subsubsections/queries/getSubsubsection"
import { Routes } from "@blitzjs/next"
import { lineString, point } from "@turf/helpers"
import { bbox, featureCollection } from "@turf/turf"
import { useRouter } from "next/router"
import React, { useState } from "react"
import { LngLatBoundsLike, MapLayerMouseEvent, Marker } from "react-map-gl/maplibre"
import { shortTitle } from "../text"
import { BaseMap } from "./BaseMap"
import { SubsubsectionMapIcon } from "./Icons"
import { TitleLabel } from "./Labels"
import { TipMarker } from "./TipMarker"
import { layerColors } from "./layerColors"
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

  // We need to separate the state to work around the issue when a marker overlaps a line and both interact
  const [hoveredMap, setHoveredMap] = useState<string | number | null>(null)
  const [hoveredMarker, setHoveredMarker] = useState<string | number | null>(null)
  const handleMouseEnter = (e: MapLayerMouseEvent) => {
    setHoveredMap(e.features?.at(0)?.properties?.subsubsectionSlug || null)
  }
  const handleMouseLeave = () => {
    setHoveredMap(null)
  }

  const [minX, minY, maxX, maxY] = bbox(lineString(selectedSubsection.geometry))
  const sectionBounds: LngLatBoundsLike = [minX, minY, maxX, maxY]

  const lines = featureCollection(
    subsections
      .map((subsection) =>
        lineString(subsection.geometry, {
          color:
            subsection.slug === selectedSubsection.slug
              ? layerColors.unselectableCurrent
              : layerColors.unselectable,
          // opacity: subsection.slug === selectedSubsection.slug ? 0.4 : 0.35,
        }),
      )
      .filter(Boolean),
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
                ? layerColors.selected
                : hoveredMap === sec.slug || hoveredMarker === sec.slug
                  ? layerColors.hovered
                  : layerColors.selectable,
          }),
      )
      .filter(Boolean),
  )

  const selectablePoints = featureCollection(
    subsubsections
      .map(
        (sec) =>
          sec.type === "AREA" &&
          point(sec.geometry, {
            subsectionSlug: sec.subsection.slug,
            subsubsectionSlug: sec.slug,
            opacity: 0.3,
            color:
              sec.slug === pageSubsubsectionSlug
                ? layerColors.selected
                : hoveredMap === sec.slug || hoveredMarker === sec.slug
                  ? layerColors.hovered
                  : layerColors.selectable,
            radius: 10,
            "border-width": 3,
            "border-color":
              sec.slug === pageSubsubsectionSlug
                ? layerColors.selected
                : hoveredMap === sec.slug || hoveredMarker === sec.slug
                  ? layerColors.hovered
                  : layerColors.selectable,
          }),
      )
      .filter(Boolean),
  )

  // Dots are only for Subsubsections of type ROUTE
  const dotsGeoms = subsubsections
    .map((sec) => sec.type === "ROUTE" && [sec.geometry[0], sec.geometry.at(-1)])
    .flat()
    .filter(Boolean)

  const markers = subsubsections.map((subsub) => {
    const [longitude, latitude] =
      subsub.type === "ROUTE" ? midPoint(subsub.geometry) : subsub.geometry

    return (
      <Marker
        key={subsub.id}
        longitude={longitude as number}
        latitude={latitude as number}
        anchor="center"
        onClick={(e) => {
          handleSelect({
            subsectionSlug: subsub.subsection.slug,
            subsubsectionSlug: subsub.slug,
            edit: e.originalEvent.altKey,
          })
        }}
      >
        <TipMarker
          anchor={subsub.labelPos}
          onMouseEnter={() => setHoveredMarker(subsub.slug)}
          onMouseLeave={() => setHoveredMarker(null)}
          className={
            // We display all subsubsections, but those of other subsections are faded out
            subsub.subsection.slug === pageSubsectionSlug
              ? "opacity-100"
              : "opacity-50 hover:opacity-100"
          }
        >
          <TitleLabel
            icon={<SubsubsectionMapIcon label={shortTitle(subsub.slug)} />}
            title={subsub.subTitle}
            subtitle={subsub.task}
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
        Schnellzugriff zum Bearbeiten über option+click (Mac) / alt+click (Windows)
      </p>
    </>
  )
}
