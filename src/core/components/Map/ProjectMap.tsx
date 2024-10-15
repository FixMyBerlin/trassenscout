import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { SubsectionWithPosition } from "@/src/server/subsections/queries/getSubsection"
import { Routes } from "@blitzjs/next"
import { lineString } from "@turf/helpers"
import { along, featureCollection, length } from "@turf/turf"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import {
  LngLatBoundsLike,
  MapEvent,
  MapLayerMouseEvent,
  Marker,
  ViewStateChangeEvent,
  useMap,
} from "react-map-gl/maplibre"
import { IfUserCanEdit } from "../../../pagesComponents/memberships/IfUserCan"
import { useUserCan } from "../../../pagesComponents/memberships/hooks/useUserCan"
import { shortTitle } from "../text"
import { BaseMap } from "./BaseMap"
import { SubsectionMapIcon } from "./Icons"
import { StartEndLabel } from "./Labels"
import { TipMarker } from "./TipMarker"
import { layerColors } from "./layerColors"
import { subsectionsBbox } from "./utils"

type Props = { subsections: SubsectionWithPosition[] }

export const ProjectMap: React.FC<Props> = ({ subsections }) => {
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const { mainMap } = useMap()
  const userCan = useUserCan()

  // bundingBox only changes when subsections change / subsections array is created
  const boundingBox = useMemo(() => {
    return subsectionsBbox(subsections) as LngLatBoundsLike
  }, [subsections])

  // we do not want to fitBounds everytime the subsections array is created (tanstack query refetches subsections on window focus)
  // we could disable refetchOnWindowFocus, in [projectId]/index.tsx with {refetchOnWindowFocus: false} https://blitzjs.com/docs/query-usage
  // but then we would not get the latest data when the user comes back to the page

  // we spread boundingBox in the dependency array to make sure the effect runs when the values of boundingBox change (not everytime the array is created)
  useEffect(() => {
    mainMap?.fitBounds(boundingBox, { padding: 60 })
    // @ts-expect-error
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainMap, ...boundingBox])

  type HandleSelectProps = { subsectionSlug: string; edit: boolean }
  const handleSelect = ({ subsectionSlug, edit }: HandleSelectProps) => {
    if (!projectSlug) return
    // alt+click
    const url =
      userCan.edit && edit
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
  const handleZoomEnd = (e: ViewStateChangeEvent) => setZoom(e.viewState.zoom)
  const handleZoomOnLoad = (e: MapEvent) => setZoom(e.target.getZoom())

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
            ? layerColors.hovered
            : layerColors.selectable,
      }),
    ),
  )

  const markers = subsections.map((sub) => {
    const midLine = lineString(sub.geometry)
    const midLengthHalf = length(midLine) / 2
    const midPoint = along(midLine, midLengthHalf)

    return (
      <Marker
        key={sub.id}
        longitude={midPoint.geometry.coordinates[0] as number}
        latitude={midPoint.geometry.coordinates[1] as number}
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
            layout={
              expandByZoom(zoom) && !(sub.slug === hoveredMarker || sub.slug === hoveredMap)
                ? "compact"
                : "details"
            }
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
          bounds: boundingBox,
          fitBoundsOptions: { padding: 60 },
        }}
        onClick={handleClickMap}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onZoomEnd={handleZoomEnd}
        onLoad={handleZoomOnLoad}
        selectableLines={selectableLines}
        dots={dotsGeoms}
      >
        {markers}
      </BaseMap>
      <IfUserCanEdit>
        <p className="mt-2 text-right text-xs text-gray-400">
          Schnellzugriff zum Bearbeiten über option+click (Mac) / alt+click (Windows)
        </p>
      </IfUserCanEdit>
    </section>
  )
}
