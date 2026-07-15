import { useNavigate } from "@tanstack/react-router"
import { useEffect, useEffectEvent, useMemo, useState } from "react"
import { MapLayerMouseEvent, type MapProps, useMap } from "react-map-gl/maplibre"
import { BaseMap } from "./BaseMap"
import { getLineEndPointsLayerId } from "./layers/LineEndPointsLayer"
import {
  getSubsectionHullOtherFillLayerId,
  SubsectionHullsLayer,
} from "./layers/SubsectionHullsLayer"
import { getUnifiedLayerId } from "./layers/UnifiedFeaturesLayer"
import { useMapLoaded } from "./map-loaded-store"
import type { SubsectionMapEntity as TGetSubsection } from "./mapEntityTypes"
import type { SubsubsectionMapEntity as SubsubsectionWithPosition } from "./mapEntityTypes"
import { MapFooter } from "./MapFooter"
import { SUBSECTION_LABEL_MIN_ZOOM } from "./markers/SubsectionMarkers"
import { SubsubsectionMarkers } from "./markers/SubsubsectionMarkers"
import { getStaticOverlayForProject } from "./staticOverlay/getStaticOverlayForProject"
import { subsectionLegendConfig } from "./SubsectionSubsubsectionMap.legendConfig"
import { geometriesBbox } from "./utils/bboxHelpers"
import { getSubsectionFeatures } from "./utils/getSubsectionFeatures"
import { getSubsubsectionFeatures } from "./utils/getSubsubsectionFeatures"
import { mergeFeatureCollections } from "./utils/mergeFeatureCollections"

const MAP_ID = "mainMap"

type Props = {
  projectSlug: string
  subsectionSlug: string
  subsections: TGetSubsection[]
  selectedSubsection: TGetSubsection
  subsubsections: SubsubsectionWithPosition[]
  selectedSubsubsectionSlug?: string
}

export const SubsubsectionMap = ({
  projectSlug,
  subsectionSlug: pageSubsectionSlug,
  subsections,
  selectedSubsection,
  subsubsections,
  selectedSubsubsectionSlug,
}: Props) => {
  const navigate = useNavigate()
  const { mainMap } = useMap()
  const mapLoaded = useMapLoaded(MAP_ID)
  const [dotMode, setDotMode] = useState<boolean | null>(null)

  const filteredSubsubsections = subsubsections.filter(
    (subsub) => subsub.subsectionId === selectedSubsection.id,
  )

  type HandleSelectProps = {
    subsectionSlug: string
    subsubsectionSlug?: string
    edit: boolean
  }
  const handleSelect = ({ subsectionSlug, subsubsectionSlug, edit }: HandleSelectProps) => {
    if (!projectSlug) return
    void navigate({
      to: edit
        ? subsubsectionSlug
          ? "/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/edit"
          : "/$projectSlug/abschnitte/$subsectionSlug/edit"
        : subsubsectionSlug
          ? "/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug"
          : "/$projectSlug/abschnitte/$subsectionSlug",
      params: {
        projectSlug,
        subsectionSlug,
        ...(subsubsectionSlug ? { subsubsectionSlug } : {}),
      },
    })
  }

  const handleClickMap = (event: MapLayerMouseEvent) => {
    const subsectionSlug = event.features?.at(0)?.properties?.subsectionSlug
    const subsubsectionSlug = event.features?.at(0)?.properties?.subsubsectionSlug

    // Handle subsection click (when subsectionSlug exists but no subsubsectionSlug)
    if (subsectionSlug && !subsubsectionSlug) {
      // Skip if clicking the selected subsection
      if (subsectionSlug === selectedSubsection.slug) return

      handleSelect({ subsectionSlug, edit: event.originalEvent?.altKey })
      return
    }

    // Handle subsubsection click
    if (subsectionSlug && subsubsectionSlug) {
      handleSelect({ subsectionSlug, subsubsectionSlug, edit: event.originalEvent?.altKey })
    }
  }

  const handleZoomEnd: NonNullable<MapProps["onZoomEnd"]> = (event) => {
    setDotMode(event.viewState.zoom < SUBSECTION_LABEL_MIN_ZOOM)
  }

  const handleLoad: NonNullable<MapProps["onLoad"]> = (event) => {
    setDotMode(event.target.getZoom() < SUBSECTION_LABEL_MIN_ZOOM)
  }

  const filteredGeometries = filteredSubsubsections.map((s) => s.geometry)
  const selectedSubsubsection = selectedSubsubsectionSlug
    ? filteredSubsubsections.find((subsub) => subsub.slug === selectedSubsubsectionSlug)
    : undefined
  const mapBbox = selectedSubsubsection
    ? geometriesBbox([selectedSubsubsection.geometry])
    : geometriesBbox([selectedSubsection.geometry, ...filteredGeometries])
  // stable string key so the effect reacts to the bbox's values, not identity
  // (tanstack query recreates the geometry arrays on every window-focus refetch)
  const mapBboxKey = mapBbox.join(",")

  const flyToSelectedSubsubsection = useEffectEvent(function flyToSelectedSubsubsection() {
    if (!mainMap || !mapLoaded) return
    mainMap.fitBounds(mapBbox, { padding: 60, duration: 1000, linear: false })
  })

  // pan/zoom whenever the target bounds change (subsection change, subsubsection
  // change, map click, marker click, or route navigation)
  useEffect(
    function panMapToSelectedSubsubsection() {
      flyToSelectedSubsubsection()
    },
    [mapLoaded, mapBboxKey],
  )

  const { lines: subsectionLines, polygons: subsectionPolygons } = useMemo(
    () =>
      getSubsectionFeatures({
        subsections,
        highlight: "currentSubsection",
        selectedSubsectionSlug: selectedSubsection.slug,
      }),
    [subsections, selectedSubsection.slug],
  )

  const {
    lines: subsubsectionLines,
    points: subsubsectionPoints,
    polygons: subsubsectionPolygons,
    lineEndPoints: subsubsectionLineEndPoints,
  } = useMemo(
    () =>
      getSubsubsectionFeatures({
        subsubsections: filteredSubsubsections,
        selectedSubsubsectionSlug: selectedSubsubsectionSlug ?? null,
      }),
    [filteredSubsubsections, selectedSubsubsectionSlug],
  )

  // Merge lines, polygons, and points into unified features
  const unifiedSubsubsectionFeatures = useMemo(
    () => mergeFeatureCollections(subsubsectionLines, subsubsectionPolygons, subsubsectionPoints),
    [subsubsectionLines, subsubsectionPolygons, subsubsectionPoints],
  )

  // Set selected state via setFeatureState when selection changes
  useEffect(
    function synchronizeSelectedSubsubsectionFeatureState() {
      if (!mainMap || !mapLoaded) return

      const map = mainMap.getMap()
      const suffix = "_subsubsection"
      const unifiedSourceId = getUnifiedLayerId(suffix)
      const endPointsSourceId = getLineEndPointsLayerId(suffix)
      const lineEndPointFeatures = subsubsectionLineEndPoints.features

      // Reset all selected states first
      // All features in BaseMap are subsubsections (subsection features are handled by hulls)
      if (unifiedSubsubsectionFeatures) {
        unifiedSubsubsectionFeatures.features.forEach((f) => {
          const featureId = f.properties?.featureId
          if (featureId) {
            map.setFeatureState({ source: unifiedSourceId, id: featureId }, { selected: false })
          }
        })
      }
      if (lineEndPointFeatures.length) {
        lineEndPointFeatures.forEach((f) => {
          const featureId = f.properties?.featureId
          if (featureId) {
            map.setFeatureState({ source: endPointsSourceId, id: featureId }, { selected: false })
          }
        })
      }

      // Set selected state for current selection (subsubsectionSlug uniquely identifies the subsubsection)
      if (selectedSubsubsectionSlug && unifiedSubsubsectionFeatures) {
        const slug = selectedSubsubsectionSlug

        // Set selected on all unified features matching the slug
        unifiedSubsubsectionFeatures.features.forEach((f) => {
          const props = f.properties as { subsubsectionSlug?: string; featureId?: string } | null
          if (props && props.subsubsectionSlug === slug) {
            const id = props.featureId
            if (id) {
              map.setFeatureState({ source: unifiedSourceId, id }, { selected: true })
            }
          }
        })

        // Set selected on line endpoints for this line
        lineEndPointFeatures
          .filter((ep) => ep.properties?.subsubsectionSlug === slug)
          .forEach((ep) => {
            const id = ep.properties?.featureId
            if (id) {
              map.setFeatureState({ source: endPointsSourceId, id }, { selected: true })
            }
          })
      }
    },
    [
      mainMap,
      mapLoaded,
      selectedSubsubsectionSlug,
      unifiedSubsubsectionFeatures,
      subsubsectionLineEndPoints,
    ],
  )

  return (
    <>
      <BaseMap
        id={MAP_ID}
        initialViewState={{
          bounds: mapBbox,
          fitBoundsOptions: { padding: 60, maxZoom: 16 },
        }}
        onClick={handleClickMap}
        interactiveLayerIds={[getSubsectionHullOtherFillLayerId("_subsubsection")]}
        lines={subsubsectionLines?.features.length ? subsubsectionLines : undefined}
        polygons={subsubsectionPolygons?.features.length ? subsubsectionPolygons : undefined}
        points={subsubsectionPoints}
        lineEndPoints={
          subsubsectionLineEndPoints?.features.length ? subsubsectionLineEndPoints : undefined
        }
        selectableLayerIdSuffix="_subsubsection"
        colorSchema="subsubsection"
        staticOverlay={getStaticOverlayForProject(projectSlug)}
        onLoad={handleLoad}
        onZoomEnd={handleZoomEnd}
      >
        <SubsectionHullsLayer
          lines={subsectionLines}
          polygons={subsectionPolygons}
          layerIdSuffix="_subsubsection"
        />
        <SubsubsectionMarkers
          subsubsections={filteredSubsubsections}
          dotMode={dotMode}
          pageSubsectionSlug={pageSubsectionSlug}
          selectedSubsubsectionSlug={selectedSubsubsectionSlug}
          onSelect={handleSelect}
        />
      </BaseMap>
      <MapFooter legendItemsConfig={subsectionLegendConfig} />
    </>
  )
}
