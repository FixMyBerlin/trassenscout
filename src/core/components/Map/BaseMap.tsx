import { clsx } from "clsx"
import type { FeatureCollection, LineString, Point, Polygon } from "geojson"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import * as pmtiles from "pmtiles"
import { useEffect, useMemo, useState } from "react"
import MapComponent, {
  MapLayerMouseEvent,
  MapProps,
  NavigationControl,
  ScaleControl,
} from "react-map-gl/maplibre"
import { BackgroundSwitcher, LayerType } from "./BackgroundSwitcher"
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
import { StaticOverlay } from "./staticOverlay/StaticOverlay"
import type { StaticOverlayConfig } from "./staticOverlay/staticOverlay.types"
import { useMapHighlight, type MapHighlightLevel } from "./useMapHighlight"
import { useSlugFeatureMap } from "./useSlugFeatureMap"
import { mergeFeatureCollections } from "./utils/mergeFeatureCollections"

const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"
export const vectorStyle = `https://api.maptiler.com/maps/a4824657-3edd-4fbd-925e-1af40ab06e9c/style.json?key=${maptilerApiKey}`
const satelliteStyle = `https://api.maptiler.com/maps/hybrid/style.json?key=${maptilerApiKey}`

export type BaseMapProps = Required<Pick<MapProps, "id" | "initialViewState">> &
  Partial<
    Pick<
      MapProps,
      "onMouseMove" | "onMouseLeave" | "onClick" | "onZoomEnd" | "onLoad" | "hash" | "reuseMaps"
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
    colorSchema: "subsection" | "subsubsection"
    restrictHighlightToLevel?: MapHighlightLevel
  }

export const BaseMap = ({
  id: mapId,
  initialViewState,
  onMouseMove,
  onMouseLeave,
  onClick,
  onZoomEnd,
  onLoad,
  interactiveLayerIds,
  hash,
  reuseMaps = true,
  lines,
  polygons,
  points,
  lineEndPoints,
  classHeight,
  children,
  staticOverlay,
  backgroundSwitcherPosition = "top-left",
  selectableLayerIdSuffix = "",
  colorSchema,
  restrictHighlightToLevel,
}: BaseMapProps) => {
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")
  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }

  const [cursorStyle, setCursorStyle] = useState("grab")

  const showScaleControl = backgroundSwitcherPosition !== "bottom-left"

  useEffect(() => {
    if (!staticOverlay) return
    const protocol = new pmtiles.Protocol()
    maplibregl.addProtocol("pmtiles", protocol.tile)
    return () => {
      maplibregl.removeProtocol("pmtiles")
    }
  }, [staticOverlay])

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

  const highlightHandlers = useMapHighlight(restrictHighlightToLevel)

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

  return (
    <div
      className={clsx(
        "w-full overflow-clip rounded-t-md drop-shadow-md",
        classHeight ?? "h-96 sm:h-[500px]",
      )}
    >
      <div className="relative h-full w-full">
        <MapComponent
          id={mapId}
          reuseMaps={reuseMaps}
          initialViewState={initialViewState}
          mapStyle={selectedLayer === "vector" ? vectorStyle : satelliteStyle}
          scrollZoom={false}
          cursor={cursorStyle}
          onMouseMove={handleMouseMoveInternal}
          onMouseLeave={handleMouseLeaveInternal}
          onClick={handleClickInternal}
          onZoomEnd={onZoomEnd}
          onLoad={onLoad}
          interactiveLayerIds={[
            ...(interactiveLayerIds ?? []),
            ...(unifiedFeatures ? getUnifiedClickTargetLayerIds(selectableLayerIdSuffix) : []),
            ...(lineEndPoints ? [getLineEndPointsLayerId(selectableLayerIdSuffix)] : []),
          ]}
          hash={hash || false}
        >
          <NavigationControl showCompass={false} />
          {showScaleControl && <ScaleControl />}
          {staticOverlay && <StaticOverlay config={staticOverlay} />}
          {unifiedFeatures && (
            <UnifiedFeaturesLayer
              features={unifiedFeatures}
              layerIdSuffix={selectableLayerIdSuffix}
              interactive={true}
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
        <BackgroundSwitcher
          position={backgroundSwitcherPosition}
          value={selectedLayer}
          onChange={handleLayerSwitch}
        />
      </div>
    </div>
  )
}
