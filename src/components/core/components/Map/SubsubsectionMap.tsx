import { useNavigate } from "@tanstack/react-router"
import { featureCollection, point } from "@turf/helpers"
import type { Point } from "geojson"
import type { GeoJSONSource, MapGeoJSONFeature } from "maplibre-gl"
import { useEffect, useEffectEvent, useState } from "react"
import { MapLayerMouseEvent, type MapProps, useMap } from "react-map-gl/maplibre"
import { BaseMap } from "./BaseMap"
import { getLineEndPointsLayerId } from "./layers/LineEndPointsLayer"
import {
  getSubsectionHullOtherFillLayerId,
  SubsectionHullsLayer,
} from "./layers/SubsectionHullsLayer"
import {
  SUBSUBSECTION_CLUSTER_INTERACTIVE_LAYER_IDS,
  SUBSUBSECTION_CLUSTER_MAX_ZOOM,
  SUBSUBSECTION_CLUSTER_SOURCE_ID,
  SubsubsectionClustersLayer,
} from "./layers/SubsubsectionClustersLayer"
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
import { getLabelPosition } from "./utils/getLabelPosition"
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
  clusterSubsubsections?: boolean
  classHeight?: string
}

export const SubsubsectionMap = ({
  projectSlug,
  subsectionSlug: pageSubsectionSlug,
  subsections,
  selectedSubsection,
  subsubsections,
  selectedSubsubsectionSlug,
  clusterSubsubsections = false,
  classHeight,
}: Props) => {
  const navigate = useNavigate()
  const { mainMap } = useMap()
  const mapLoaded = useMapLoaded(MAP_ID)
  const [dotMode, setDotMode] = useState<boolean | null>(null)
  const [clusterZoomActive, setClusterZoomActive] = useState<boolean | null>(null)
  const clusterMode = clusterSubsubsections && clusterZoomActive === true

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

  const handleClusterClick = (event: MapLayerMouseEvent, feature: MapGeoJSONFeature) => {
    const clusterIdValue = feature.properties?.cluster_id
    const clusterId = typeof clusterIdValue === "number" ? clusterIdValue : Number(clusterIdValue)

    if (!Number.isFinite(clusterId) || feature.geometry.type !== "Point") return false
    const coordinates = (feature.geometry as Point).coordinates
    const longitude = coordinates[0]
    const latitude = coordinates[1]
    if (longitude == null || latitude == null) return false

    const source = event.target.getSource(SUBSUBSECTION_CLUSTER_SOURCE_ID)
    if (!source || !("getClusterExpansionZoom" in source)) return false

    void (source as GeoJSONSource)
      .getClusterExpansionZoom(clusterId)
      .then((zoom) => {
        event.target.easeTo({
          center: [longitude, latitude],
          zoom,
          duration: 350,
        })
      })
      .catch((error: unknown) => {
        // Cluster ids are invalidated whenever the source data changes; a stale
        // click just means "no zoom happened" and must not break the map.
        console.warn("getClusterExpansionZoom failed", error)
      })

    return true
  }

  const handleClickMap = (event: MapLayerMouseEvent) => {
    const features = event.features ?? []
    const clusterFeature = features.find((feature) => feature.properties?.cluster_id != null)
    if (clusterFeature && handleClusterClick(event, clusterFeature)) return

    // Prefer the more specific subsubsection hit over enclosing subsection hulls.
    const subsubsectionFeature = features.find((feature) => feature.properties?.subsubsectionSlug)
    const subsectionFeature =
      subsubsectionFeature ?? features.find((feature) => feature.properties?.subsectionSlug)
    const subsectionSlug = subsectionFeature?.properties?.subsectionSlug
    const subsubsectionSlug = subsubsectionFeature?.properties?.subsubsectionSlug

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
    setClusterZoomActive(event.viewState.zoom <= SUBSUBSECTION_CLUSTER_MAX_ZOOM)
  }

  const handleLoad: NonNullable<MapProps["onLoad"]> = (event) => {
    const zoom = event.target.getZoom()
    setDotMode(zoom < SUBSECTION_LABEL_MIN_ZOOM)
    setClusterZoomActive(zoom <= SUBSUBSECTION_CLUSTER_MAX_ZOOM)
  }

  const filteredGeometries = filteredSubsubsections.map((s) => s.geometry)
  const subsubsectionClusterPoints = clusterMode
    ? featureCollection(
        filteredSubsubsections.map((subsubsection) =>
          point(getLabelPosition(subsubsection.geometry, subsubsection.labelPos), {
            subsectionSlug: subsubsection.subsection.slug,
            subsubsectionSlug: subsubsection.slug,
          }),
        ),
      )
    : undefined
  const clusterLayersVisible = (subsubsectionClusterPoints?.features.length ?? 0) > 0
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

  const { lines: subsectionLines, polygons: subsectionPolygons } = getSubsectionFeatures({
    subsections,
    highlight: "currentSubsection",
    selectedSubsectionSlug: selectedSubsection.slug,
  })

  const {
    lines: subsubsectionLines,
    points: subsubsectionPoints,
    polygons: subsubsectionPolygons,
    lineEndPoints: subsubsectionLineEndPoints,
  } = getSubsubsectionFeatures({
    subsubsections: filteredSubsubsections,
    selectedSubsubsectionSlug: selectedSubsubsectionSlug ?? null,
  })

  // Merge lines, polygons, and points into unified features
  const unifiedSubsubsectionFeatures = mergeFeatureCollections(
    subsubsectionLines,
    subsubsectionPolygons,
    subsubsectionPoints,
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
    <div className={classHeight ? "flex min-h-0 flex-1 flex-col" : undefined}>
      <BaseMap
        id={MAP_ID}
        initialViewState={{
          bounds: mapBbox,
          fitBoundsOptions: { padding: 60, maxZoom: 16 },
        }}
        onClick={handleClickMap}
        interactiveLayerIds={[
          getSubsectionHullOtherFillLayerId("_subsubsection"),
          ...(clusterLayersVisible ? SUBSUBSECTION_CLUSTER_INTERACTIVE_LAYER_IDS : []),
        ]}
        lines={subsubsectionLines?.features.length ? subsubsectionLines : undefined}
        polygons={subsubsectionPolygons?.features.length ? subsubsectionPolygons : undefined}
        points={clusterMode ? undefined : subsubsectionPoints}
        lineEndPoints={
          subsubsectionLineEndPoints?.features.length ? subsubsectionLineEndPoints : undefined
        }
        selectableLayerIdSuffix="_subsubsection"
        colorSchema="subsubsection"
        staticOverlay={getStaticOverlayForProject(projectSlug)}
        onLoad={handleLoad}
        onZoomEnd={handleZoomEnd}
        classHeight={classHeight}
      >
        <SubsectionHullsLayer
          lines={subsectionLines}
          polygons={subsectionPolygons}
          layerIdSuffix="_subsubsection"
        />
        <SubsubsectionClustersLayer points={subsubsectionClusterPoints} />
        {!clusterMode && (
          <SubsubsectionMarkers
            subsubsections={filteredSubsubsections}
            dotMode={dotMode}
            pageSubsectionSlug={pageSubsectionSlug}
            selectedSubsubsectionSlug={selectedSubsubsectionSlug}
            onSelect={handleSelect}
          />
        )}
      </BaseMap>
      <MapFooter legendItemsConfig={subsectionLegendConfig} pinned={Boolean(classHeight)} />
    </div>
  )
}
