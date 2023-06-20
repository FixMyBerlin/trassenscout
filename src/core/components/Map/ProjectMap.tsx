import { Routes, useParam } from "@blitzjs/next"
import { lineString } from "@turf/helpers"
import { along, featureCollection, length } from "@turf/turf"
import { useRouter } from "next/router"
import React, { useState } from "react"
import { MapLayerMouseEvent, Marker } from "react-map-gl"
import { SubsectionWithPosition } from "src/subsections/queries/getSubsection"
import { shortTitle } from "../text"
import { BaseMap } from "./BaseMap"
import { SectionMapIcon } from "./Icons"
import { StartEndLabel } from "./Labels"
import { TipMarker } from "./TipMarker"
import { lineColors } from "./lineColors"
import { subsectionsBbox } from "./utils"

type Props = { subsections: SubsectionWithPosition[] }

export const ProjectMap: React.FC<Props> = ({ subsections }) => {
  const router = useRouter()
  const projectSlug = useParam("projectSlug", "string")

  const handleSelect = (subsectionSlug: string, edit: boolean) => {
    if (edit) {
      void router.push(Routes.EditSubsectionPage({ projectSlug: projectSlug!, subsectionSlug }))
    } else {
      void router.push(
        Routes.SubsectionDashboardPage({ projectSlug: projectSlug!, subsectionSlug })
      )
    }
  }

  const [hovered, setHovered] = useState<number | string | null>(null)
  // TODO:
  const getId = (e: MapLayerMouseEvent | undefined) => e?.features?.[0]?.properties?.id || null
  const handleClick = async (e: MapLayerMouseEvent | undefined) =>
    getId(e) && handleSelect(getId(e), e!.originalEvent.ctrlKey)
  const handleMouseEnter = (e: MapLayerMouseEvent | undefined) => setHovered(getId(e))
  const handleMouseLeave = () => setHovered(null)

  const dotsGeoms = subsections
    .map((ss) => [ss.geometry.at(0), ss.geometry.at(-1)])
    .flat()
    .filter(Boolean)

  const selectableLines = featureCollection(
    subsections.map((subsection) =>
      lineString(subsection.geometry, {
        subsectionSlug: subsection.slug,
        color: hovered === subsection.slug ? lineColors.hovered : lineColors.selectable,
      })
    )
  )

  const markers = subsections.map((ss) => {
    const midLine = lineString(ss.geometry)
    const midLengthHalf = length(midLine) / 2
    const midPoint = along(midLine, midLengthHalf)

    return (
      <Marker
        key={ss.id}
        longitude={midPoint.geometry.coordinates[0]}
        latitude={midPoint.geometry.coordinates[1]}
        anchor="center"
        onClick={(e) => handleSelect(ss.slug, e.originalEvent.ctrlKey)}
      >
        <TipMarker
          anchor={ss.labelPos || "top"}
          onMouseEnter={() => setHovered(ss.slug)}
          onMouseLeave={() => setHovered(null)}
        >
          <StartEndLabel
            icon={<SectionMapIcon label={shortTitle(ss.slug)} />}
            start={ss.start}
            end={ss.end}
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
