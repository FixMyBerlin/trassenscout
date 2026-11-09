import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { featureCollection } from "@turf/helpers"
import type { FeatureCollection, Geometry } from "geojson"
import { useEffect, useEffectEvent, useMemo, useState } from "react"
import { MapLayerMouseEvent, type MapProps, useMap } from "react-map-gl/maplibre"
import { BaseMap } from "./BaseMap"
import {
  getSubsectionHullOtherFillLayerId,
  SubsectionHullsLayer,
} from "./layers/SubsectionHullsLayer"
import { useMapLoaded } from "./map-loaded-store"
import type { SubsectionMapEntities as TSubsections } from "./mapEntityTypes"
import { MapFooter } from "./MapFooter"
import { SubsectionMarkers, SUBSECTION_LABEL_MIN_ZOOM } from "./markers/SubsectionMarkers"
import { projectLegendConfig, projectSearchLegendConfig } from "./ProjectMap.legendConfig"
import { getStaticOverlayForProject } from "./staticOverlay/getStaticOverlayForProject"
import { geometriesBbox } from "./utils/bboxHelpers"
import { getSubsectionFeatures } from "./utils/getSubsectionFeatures"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

const filterByCurrent = <G extends Geometry, P extends { isCurrent: boolean }>(
  collection: FeatureCollection<G, P>,
  isCurrent: boolean,
) => {
  const features = collection.features.filter(
    (feature) => feature.properties.isCurrent === isCurrent,
  )
  return features.length ? featureCollection(features) : undefined
}

type Props = {
  subsections: TSubsections
  classHeight?: string
  /** Set while searching: matches keep their original blue, the others fade out. */
  search?: {
    searchterm: string
    matchedSubsectionSlugs: Set<string>
    /** Opening one of these keeps the term, so its page lists the matching subsubsections. */
    slugsWithSubsubsectionMatches: Set<string>
  }
}

export const ProjectMap = ({ subsections, classHeight, search }: Props) => {
  const navigate = useNavigate()
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { mainMap } = useMap()
  const mapLoaded = useMapLoaded("mainMap")
  const [dotMode, setDotMode] = useState<boolean | null>(null)

  // bundingBox only changes when subsections change / subsections array is created
  const boundingBox = useMemo(
    () => geometriesBbox(subsections.map((ss) => ss.geometry)),
    [subsections],
  )
  // stable string key so the effect below reacts to the bbox's values, not the array's identity
  // (tanstack query recreates `subsections`, and therefore `boundingBox`, on every window-focus refetch)
  const boundingBoxKey = boundingBox.join(",")

  const fitMapToBoundingBox = useEffectEvent(function fitMapToBoundingBox() {
    if (!mainMap || !mapLoaded) return
    mainMap.fitBounds(boundingBox, { padding: 60 })
  })

  useEffect(
    function fitMapToSelectedSubsections() {
      fitMapToBoundingBox()
    },
    [mapLoaded, boundingBoxKey],
  )

  type HandleSelectProps = { subsectionSlug: string; edit: boolean }
  const handleSelect = ({ subsectionSlug, edit }: HandleSelectProps) => {
    if (!projectSlug) return
    if (edit) {
      void navigate({
        to: "/$projectSlug/abschnitte/$subsectionSlug/edit",
        params: { projectSlug, subsectionSlug },
      })
      return
    }
    void navigate({
      to: "/$projectSlug/abschnitte/$subsectionSlug",
      params: { projectSlug, subsectionSlug },
      search: search?.slugsWithSubsubsectionMatches.has(subsectionSlug)
        ? { searchterm: search.searchterm }
        : undefined,
    })
  }

  const handleClickMap = (e: MapLayerMouseEvent) => {
    // Where a grey hull overlaps a match, the click belongs to the match.
    const clickedFeature =
      e.features?.find((feature) =>
        search?.matchedSubsectionSlugs.has(feature.properties?.subsectionSlug),
      ) ?? e.features?.at(0)
    const subsectionSlug = clickedFeature?.properties?.subsectionSlug
    if (subsectionSlug) {
      handleSelect({ subsectionSlug, edit: e.originalEvent?.altKey })
    }
  }

  const handleZoomEnd: NonNullable<MapProps["onZoomEnd"]> = (event) => {
    setDotMode(event.viewState.zoom < SUBSECTION_LABEL_MIN_ZOOM)
  }

  const handleLoad: NonNullable<MapProps["onLoad"]> = (event) => {
    setDotMode(event.target.getZoom() < SUBSECTION_LABEL_MIN_ZOOM)
  }

  const matchedSubsectionSlugs = search?.matchedSubsectionSlugs
  const {
    lines: selectableLines,
    polygons: selectablePolygons,
    lineEndPoints: lineEndPointsGeoms,
  } = useMemo(
    () =>
      getSubsectionFeatures(
        matchedSubsectionSlugs
          ? { subsections, highlight: "matches", matchedSubsectionSlugs }
          : { subsections, highlight: "all" },
      ),
    [subsections, matchedSubsectionSlugs],
  )

  return (
    <section className={classHeight ? "flex min-h-0 flex-1 flex-col" : "mt-3"}>
      <BaseMap
        id="mainMap"
        initialViewState={{
          bounds: boundingBox,
          fitBoundsOptions: { padding: 60 },
        }}
        onClick={handleClickMap}
        interactiveLayerIds={search ? [getSubsectionHullOtherFillLayerId("")] : undefined}
        lines={filterByCurrent(selectableLines, true)}
        polygons={filterByCurrent(selectablePolygons, true)}
        lineEndPoints={filterByCurrent(lineEndPointsGeoms, true)}
        colorSchema="subsection"
        staticOverlay={getStaticOverlayForProject(projectSlug)}
        onLoad={handleLoad}
        onZoomEnd={handleZoomEnd}
        classHeight={classHeight}
      >
        {search ? (
          <SubsectionHullsLayer
            lines={filterByCurrent(selectableLines, false)}
            polygons={filterByCurrent(selectablePolygons, false)}
            layerIdSuffix=""
            fadedOthers
          />
        ) : null}
        <SubsectionMarkers
          subsections={subsections}
          dotMode={dotMode}
          matchedSubsectionSlugs={matchedSubsectionSlugs}
          onSelect={handleSelect}
        />
      </BaseMap>
      <MapFooter
        legendItemsConfig={search ? projectSearchLegendConfig : projectLegendConfig}
        pinned={Boolean(classHeight)}
      />
    </section>
  )
}
