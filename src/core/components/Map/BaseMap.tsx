import { clsx } from "clsx"
import type { FeatureCollection, LineString, Point, Polygon } from "geojson"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import * as pmtiles from "pmtiles"
import { useEffect, useMemo, useRef, useState } from "react"
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
}: BaseMapProps) => {
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")
  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }

  const [cursorStyle, setCursorStyle] = useState("grab")

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

  // Build feature map grouped by slug (only needed for selected state, not hover)
  // This allows highlighting all features belonging to the same subsubsection/subsection
  type SlugFeatureIds = {
    featureIds: string[]
    endPointIds: string[]
  }
  const slugFeatureMap = useMemo(() => {
    const map = new Map<string, SlugFeatureIds>()

    const getSlug = (props: { subsubsectionSlug?: string; subsectionSlug?: string }) =>
      props.subsubsectionSlug || props.subsectionSlug

    // Process unified features (lines, polygons, points)
    if (unifiedFeatures) {
      unifiedFeatures.features.forEach((f) => {
        const slug = getSlug(f.properties || {})
        const featureId = f.properties?.featureId
        if (slug && featureId) {
          const featureIds = map.get(slug) ?? {
            featureIds: [],
            endPointIds: [],
          }
          featureIds.featureIds.push(featureId)
          map.set(slug, featureIds)
        }
      })
    }

    // Process endpoints
    if (lineEndPoints) {
      lineEndPoints.features.forEach((f) => {
        const lineId = f.properties?.lineId
        const featureId = f.properties?.featureId
        if (lineId && featureId) {
          const lineIdStr = String(lineId)
          const featureIds = map.get(lineIdStr) ?? {
            featureIds: [],
            endPointIds: [],
          }
          featureIds.endPointIds.push(featureId)
          map.set(lineIdStr, featureIds)
        }
      })
    }

    return map
  }, [unifiedFeatures, lineEndPoints])

  // Track previous hovered slug to avoid unnecessary global state updates
  const previousHoveredSlugRef = useRef<string | null>(null)

  // Handle hover state via MapLibre internal global state
  // Use onMouseMove instead of onMouseEnter to detect changes when moving between overlapping features
  const handleMouseMoveInternal = (e: MapLayerMouseEvent) => {
    const map = e.target
    const features = e.features || []

    if (!map || features.length === 0) {
      // No features under cursor - clear highlight if needed
      if (previousHoveredSlugRef.current !== null) {
        map.setGlobalStateProperty("highlightSlug", null)
        previousHoveredSlugRef.current = null
      }
      setCursorStyle("grab")
      if (onMouseMove) onMouseMove(e)
      return
    }

    // Get the first feature (topmost feature)
    const feature = features[0]
    const featureId = feature?.properties?.featureId
    if (!feature || !featureId || !feature.source) {
      // Invalid feature - clear highlight if needed
      if (previousHoveredSlugRef.current !== null) {
        map.setGlobalStateProperty("highlightSlug", null)
        previousHoveredSlugRef.current = null
      }
      setCursorStyle("grab")
      if (onMouseMove) onMouseMove(e)
      return
    }

    // Extract slug to set MapLibre internal global state
    // DashboardMap uses projectSlug to highlight all subsections for a project
    const rawSlug =
      feature.properties?.projectSlug ||
      feature.properties?.subsubsectionSlug ||
      feature.properties?.subsectionSlug ||
      feature.properties?.lineId
    const lookupSlug = rawSlug ? String(rawSlug) : undefined

    // Only update global state if the slug actually changed
    if (lookupSlug !== previousHoveredSlugRef.current) {
      if (lookupSlug) {
        map.setGlobalStateProperty("highlightSlug", lookupSlug)
      } else {
        map.setGlobalStateProperty("highlightSlug", null)
      }
      previousHoveredSlugRef.current = lookupSlug ?? null
    }

    setCursorStyle("pointer")
    // Call onMouseMove if provided (for parent components that need it)
    if (onMouseMove) onMouseMove(e)
  }

  const handleMouseLeaveInternal = (event: MapLayerMouseEvent) => {
    const map = event.target
    if (!map) {
      setCursorStyle("grab")
      if (onMouseLeave) onMouseLeave(event)
      return
    }

    map.setGlobalStateProperty("highlightSlug", null)
    previousHoveredSlugRef.current = null

    setCursorStyle("grab")
    if (onMouseLeave) onMouseLeave(event)
  }

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
    const lookupSlug =
      feature?.properties?.subsubsectionSlug ||
      feature?.properties?.subsectionSlug ||
      feature?.properties?.lineId

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

  const handleZoomEnd = (e: ViewStateChangeEvent) => {
    if (onZoomEnd) onZoomEnd(e)
  }
  const handleOnLoad = (e: MapEvent) => {
    if (onLoad) onLoad(e)
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
          onZoomEnd={handleZoomEnd}
          onLoad={handleOnLoad}
          interactiveLayerIds={[
            ...(interactiveLayerIds ?? []),
            ...(unifiedFeatures ? getUnifiedClickTargetLayerIds(selectableLayerIdSuffix) : []),
            ...(lineEndPoints ? [getLineEndPointsLayerId(selectableLayerIdSuffix)] : []),
          ]}
          hash={hash || false}
        >
          <NavigationControl showCompass={false} />
          <ScaleControl />
          {staticOverlay && <StaticOverlay config={staticOverlay} />}
          {unifiedFeatures && (
            <UnifiedFeaturesLayer
              features={unifiedFeatures}
              layerIdSuffix={selectableLayerIdSuffix}
              interactive={true}
              colorSchema={colorSchema}
            />
          )}
          {lineEndPoints && (
            <LineEndPointsLayer
              lineEndPoints={lineEndPoints}
              layerIdSuffix={selectableLayerIdSuffix}
              colorSchema={colorSchema}
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
