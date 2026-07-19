import type { FeatureCollection, LineString, Point, Polygon } from "geojson"
import type { MapLibreEvent } from "maplibre-gl"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import "maplibre-gl/dist/maplibre-gl.css"
import MapComponent, {
  AttributionControl,
  MapLayerMouseEvent,
  MapProps,
  NavigationControl,
  ScaleControl,
} from "react-map-gl/maplibre"
import { twJoin } from "tailwind-merge"
import {
  exposeMainMapForDebugging,
  firePlaywrightMapLoadedEvent,
} from "@/src/components/shared/utils/playwright"
import { BackgroundSwitcher, LayerType } from "./BackgroundSwitcher/BackgroundSwitcher"
import {
  LineEndPointsLayer,
  getLineEndPointsLayerId,
  type LineEndPointsLayerProps,
} from "./layers/LineEndPointsLayer"
import {
  UnifiedFeaturesLayer,
  getUnifiedClickTargetLayerIds,
  getUnifiedLayerId,
  type UnifiedFeatureProperties,
} from "./layers/UnifiedFeaturesLayer"
import { useMapLoadedActions } from "./map-loaded-store"
import { MapHighlightContext } from "./mapHighlightContext"
import { applyMapHighlight, CLEAR_MAP_HIGHLIGHT, type MapHighlightState } from "./mapHighlightState"
import { getMapStyle } from "./mapStyleConfig"
import { retainPmtilesProtocol } from "./pmtilesProtocol"
import { StaticOverlay } from "./staticOverlay/StaticOverlay"
import type { StaticOverlayConfig } from "./staticOverlay/staticOverlay.types"
import { useMapHighlight, type MapHighlightLevel } from "./useMapHighlight"
import { useSlugFeatureMap } from "./useSlugFeatureMap"
import { mergeFeatureCollections } from "./utils/mergeFeatureCollections"

export type BaseMapProps = Required<Pick<MapProps, "id" | "initialViewState">> &
  Partial<
    Pick<
      MapProps,
      | "onMouseMove"
      | "onMouseLeave"
      | "onClick"
      | "onContextMenu"
      | "onZoomEnd"
      | "onLoad"
      | "onIdle"
      | "onRemove"
      | "hash"
      | "reuseMaps"
      | "scrollZoom"
    >
  > & {
    interactiveLayerIds?: string[]
    lines?: FeatureCollection<LineString, UnifiedFeatureProperties>
    polygons?: FeatureCollection<Polygon, UnifiedFeatureProperties>
    points?: FeatureCollection<Point, UnifiedFeatureProperties>
  } & Omit<LineEndPointsLayerProps, "layerIdSuffix" | "lineEndPoints"> &
  Partial<Pick<LineEndPointsLayerProps, "lineEndPoints">> & {
    classHeight?: string
    children?: React.ReactNode
    staticOverlay?: StaticOverlayConfig
    backgroundSwitcherPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
    selectableLayerIdSuffix?: string // Defaults to "" if not provided
    interactiveUnifiedFeatures?: boolean
    colorSchema?: "subsection" | "subsubsection"
    restrictHighlightToLevel?: MapHighlightLevel
  }

export const BaseMap = ({
  id: mapId,
  initialViewState,
  onMouseMove,
  onMouseLeave,
  onClick,
  onContextMenu,
  onZoomEnd,
  onLoad,
  onIdle,
  onRemove,
  interactiveLayerIds,
  hash,
  reuseMaps = true,
  scrollZoom,
  lines,
  polygons,
  points,
  lineEndPoints,
  classHeight,
  children,
  staticOverlay,
  backgroundSwitcherPosition = "top-left",
  selectableLayerIdSuffix = "",
  interactiveUnifiedFeatures = true,
  colorSchema,
  restrictHighlightToLevel,
}: BaseMapProps) => {
  const { markMapLoaded, resetMapLoaded } = useMapLoadedActions()
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")
  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }

  const [cursorStyle, setCursorStyle] = useState("grab")

  const showScaleControl = backgroundSwitcherPosition !== "bottom-left"

  useEffect(
    function registerPmtilesProtocolForStaticOverlay() {
      if (!staticOverlay) return
      return retainPmtilesProtocol()
    },
    [staticOverlay],
  )

  // Merge lines, polygons, and points into a single FeatureCollection
  const unifiedFeatures = useMemo(
    () => mergeFeatureCollections(lines, polygons, points),
    [lines, polygons, points],
  )

  // Map layer source IDs - shared across all handlers (still needed for selected state)
  const sourceIds = {
    unified: getUnifiedLayerId(selectableLayerIdSuffix),
    endPoints: getLineEndPointsLayerId(selectableLayerIdSuffix),
  }

  const [mapHighlight, setMapHighlight] = useState<MapHighlightState>(CLEAR_MAP_HIGHLIGHT)
  const mapHighlightRef = useRef(mapHighlight)

  useEffect(
    function syncMapHighlightRef() {
      mapHighlightRef.current = mapHighlight
    },
    [mapHighlight],
  )

  const syncMapHighlight = useCallback(
    (map: Parameters<typeof applyMapHighlight>[0], next: MapHighlightState) => {
      const prev = mapHighlightRef.current
      if (
        prev.project === next.project &&
        prev.subsection === next.subsection &&
        prev.subsubsection === next.subsubsection
      ) {
        return
      }
      mapHighlightRef.current = next
      applyMapHighlight(map, next, setMapHighlight)
    },
    [],
  )

  const highlightHandlers = useMapHighlight(restrictHighlightToLevel, syncMapHighlight)

  const handleMouseMoveInternal = (event: MapLayerMouseEvent) => {
    highlightHandlers.handleMouseMove(event)
    setCursorStyle((event.features?.length ?? 0) > 0 ? "pointer" : "grab")
    onMouseMove?.(event)
  }

  const handleMouseLeaveInternal = (event: MapLayerMouseEvent) => {
    highlightHandlers.handleMouseLeave(event)
    setCursorStyle("grab")
    onMouseLeave?.(event)
  }

  // Build feature map grouped by slug (only needed for selected state, not hover)
  // This allows highlighting all features belonging to the same subsubsection/subsection
  const slugFeatureMap = useSlugFeatureMap(unifiedFeatures, lineEndPoints)

  // Handle selection state via setFeatureState
  const handleClickInternal = (event: MapLayerMouseEvent) => {
    const map = event.target
    const features = event.features || []
    if (!map || features.length === 0) {
      if (onClick) onClick(event)
      return
    }

    // Reset selected state for ALL features in unified source
    if (unifiedFeatures) {
      unifiedFeatures.features.forEach((f) => {
        const featureId = f.properties?.featureId
        if (featureId) {
          map.setFeatureState({ source: sourceIds.unified, id: featureId }, { selected: false })
        }
      })
    }

    // Reset selected state for line endpoints
    if (lineEndPoints) {
      lineEndPoints.features.forEach((f) => {
        const featureId = f.properties?.featureId
        if (featureId) {
          map.setFeatureState({ source: sourceIds.endPoints, id: featureId }, { selected: false })
        }
      })
    }

    // Set selected on all features from the same subsubsection/subsection
    const feature = features[0]
    const lookupSlug = feature?.properties?.subsubsectionSlug || feature?.properties?.subsectionSlug

    if (lookupSlug) {
      const featureIds = slugFeatureMap.get(lookupSlug)
      if (featureIds) {
        // Set selected on all unified features from this subsubsection/subsection
        featureIds.featureIds.forEach((id) => {
          map.setFeatureState({ source: sourceIds.unified, id }, { selected: true })
        })

        // Set selected on line endpoints
        featureIds.endPointIds.forEach((id) => {
          map.setFeatureState({ source: sourceIds.endPoints, id }, { selected: true })
        })
      }
    }

    // Call parent onClick for navigation logic
    if (onClick) onClick(event)
  }

  function handleLoadInternal(event: MapLibreEvent) {
    exposeMainMapForDebugging(event.target)
    firePlaywrightMapLoadedEvent()
    markMapLoaded(mapId)
    onLoad?.(event)
  }

  function handleRemoveInternal(event: MapLibreEvent) {
    resetMapLoaded(mapId)
    onRemove?.(event)
  }

  const isFullscreen = Boolean(classHeight)

  return (
    <div
      className={twJoin(
        "w-full",
        isFullscreen
          ? "min-h-0 overflow-hidden"
          : "h-96 overflow-clip rounded-t-md drop-shadow-md sm:h-[500px]",
        classHeight,
      )}
    >
      <div className="relative h-full w-full">
        <MapHighlightContext.Provider
          value={{ highlight: mapHighlight, syncHighlight: syncMapHighlight }}
        >
          <MapComponent
            id={mapId}
            reuseMaps={reuseMaps}
            initialViewState={initialViewState}
            mapStyle={getMapStyle(selectedLayer)}
            scrollZoom={scrollZoom ?? true}
            cursor={cursorStyle}
            onMouseMove={handleMouseMoveInternal}
            onMouseLeave={handleMouseLeaveInternal}
            onClick={handleClickInternal}
            onContextMenu={onContextMenu}
            onZoomEnd={onZoomEnd}
            onLoad={handleLoadInternal}
            onIdle={onIdle}
            onRemove={handleRemoveInternal}
            interactiveLayerIds={[
              ...(interactiveLayerIds ?? []),
              ...(unifiedFeatures && interactiveUnifiedFeatures
                ? getUnifiedClickTargetLayerIds(selectableLayerIdSuffix)
                : []),
              ...(lineEndPoints && interactiveUnifiedFeatures
                ? [getLineEndPointsLayerId(selectableLayerIdSuffix)]
                : []),
            ]}
            hash={hash || false}
            attributionControl={false}
          >
            <AttributionControl compact={true} position="bottom-right" />
            <NavigationControl showCompass={false} />
            {showScaleControl && <ScaleControl />}
            {staticOverlay && <StaticOverlay config={staticOverlay} />}
            {unifiedFeatures && (
              <UnifiedFeaturesLayer
                features={unifiedFeatures}
                layerIdSuffix={selectableLayerIdSuffix}
                interactive={interactiveUnifiedFeatures}
                colorSchema={colorSchema}
                layersBetweenLinesAndPoints={
                  lineEndPoints ? (
                    <LineEndPointsLayer
                      lineEndPoints={lineEndPoints}
                      layerIdSuffix={selectableLayerIdSuffix}
                      colorSchema={colorSchema}
                    />
                  ) : undefined
                }
              />
            )}
            {children}
          </MapComponent>
        </MapHighlightContext.Provider>
        <BackgroundSwitcher
          position={backgroundSwitcherPosition}
          value={selectedLayer}
          onChange={handleLayerSwitch}
        />
      </div>
    </div>
  )
}
