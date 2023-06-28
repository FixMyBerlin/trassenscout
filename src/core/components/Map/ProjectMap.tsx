import { Routes, useParam } from "@blitzjs/next"
import { lineString } from "@turf/helpers"
import { along, featureCollection, length } from "@turf/turf"
import { useRouter } from "next/router"
import React, { useState } from "react"
import { MapLayerMouseEvent, Marker, ViewStateChangeEvent } from "react-map-gl"
import { SubsectionWithPosition } from "src/subsections/queries/getSubsection"
import { shortTitle } from "../text"
import { BaseMap } from "./BaseMap"
import { SubsectionMapIcon } from "./Icons"
import { StartEndLabel } from "./Labels"
import { TipMarker } from "./TipMarker"
import { lineColors } from "./lineColors"
import { subsectionsBbox } from "./utils"

type Props = { subsections: SubsectionWithPosition[] }

export const ProjectMap: React.FC<Props> = ({ subsections }) => {
  const router = useRouter()
  const projectSlug = useParam("projectSlug", "string")

  type HandleSelectProps = { subsectionSlug: string; edit: boolean }
  const handleSelect = ({ subsectionSlug, edit }: HandleSelectProps) => {
    if (!projectSlug) return
    // alt+click
    let url = edit
      ? Routes.EditSubsectionPage({ projectSlug, subsectionSlug })
      : Routes.SubsectionDashboardPage({ projectSlug, subsectionSlug })

    void router.push(url, undefined, { scroll: edit ? true : false })
  }

  const handleClickMap = (e: MapLayerMouseEvent) => {
    const subsectionSlug = e.features?.at(0)?.properties?.subsectionSlug
    if (subsectionSlug) {
      handleSelect({ subsectionSlug, edit: e.originalEvent?.altKey })
    }
  }

  const [zoom, setZoom] = useState<number | null>(null)
  const expandByZoom = (zoom: number | null) => !!zoom && zoom < 13
  const handleZoomEnd = (e: ViewStateChangeEvent) => {
    setZoom(e.viewState.zoom)
  }

  // We need to separate the state to work around the issue when a marker overlaps a line and both interact
  const [hoveredMap, setHoveredMap] = useState<string | null>(null)
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null)
  const handleMouseEnter = (e: MapLayerMouseEvent) => {
    setHoveredMap(e.features?.at(0)?.properties?.subsectionSlug || null)
  }
  const handleMouseLeave = () => {
    setHoveredMap(null)
  }

  const dotsGeoms = subsections
    .map((ss) => [ss.geometry.at(0), ss.geometry.at(-1)])
    .flat()
    .filter(Boolean)

  const selectableLines = featureCollection(
    subsections.map((subsection) =>
      lineString(subsection.geometry, {
        subsectionSlug: subsection.slug,
        color:
          hoveredMap === subsection.slug || hoveredMarker === subsection.slug
            ? lineColors.hovered
            : lineColors.selectable,
      })
    )
  )

  const markers = subsections.map((sub) => {
    const midLine = lineString(sub.geometry)
    const midLengthHalf = length(midLine) / 2
    const midPoint = along(midLine, midLengthHalf)

    return (
      <Marker
        key={sub.id}
        longitude={midPoint.geometry.coordinates[0]}
        latitude={midPoint.geometry.coordinates[1]}
        anchor="center"
        onClick={(e) => handleSelect({ subsectionSlug: sub.slug, edit: e.originalEvent.altKey })}
      >
        <TipMarker
          anchor={sub.labelPos}
          onMouseEnter={() => setHoveredMarker(sub.slug)}
          onMouseLeave={() => setHoveredMarker(null)}
        >
          <StartEndLabel
            icon={<SubsectionMapIcon label={shortTitle(sub.slug)} />}
            subIcon={sub.operator?.slug}
            start={sub.start}
            end={sub.end}
            // allow details when zoomed in _and_ when hovered
            compact={expandByZoom(zoom) && !(sub.slug === hoveredMarker || sub.slug === hoveredMap)}
          />
        </TipMarker>
      </Marker>
    )
  })

  return (
    <section className="mt-3">
      <BaseMap
        id="mainMap"
        initialViewState={{
          bounds: subsectionsBbox(subsections),
          fitBoundsOptions: { padding: 60 },
        }}
        onClick={handleClickMap}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onZoomEnd={handleZoomEnd}
        selectableLines={selectableLines}
        dots={dotsGeoms}
        hash={true}
      >
        {markers}
      </BaseMap>
      <p className="mt-2 text-right text-xs text-gray-400">
        Schnellzugriff zum Bearbeitne über option+click (Mac) / alt+click (Windows)
      </p>
    </section>
  )
}
