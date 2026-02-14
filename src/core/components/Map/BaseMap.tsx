import { clsx } from "clsx"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import * as pmtiles from "pmtiles"
import { useEffect, useRef, useState } from "react"
import MapComponent, {
  MapEvent,
  MapLayerMouseEvent,
  MapProps,
  NavigationControl,
  ScaleControl,
  ViewStateChangeEvent,
} from "react-map-gl/maplibre"
import { BackgroundSwitcher, LayerType } from "./BackgroundSwitcher"
import {
  LineEndPointsLayer,
  getLineEndPointsLayerId,
  type LineEndPointsLayerProps,
} from "./layers/LineEndPointsLayer"
import { LinesLayer, getLineLayerId, type LinesLayerProps } from "./layers/LinesLayer"
import { PointsLayer, getPointLayerId, type PointsLayerProps } from "./layers/PointsLayer"
import { PolygonsLayer, getPolygonLayerId, type PolygonsLayerProps } from "./layers/PolygonsLayer"
import { StaticOverlay } from "./staticOverlay/StaticOverlay"
import type { StaticOverlayConfig } from "./staticOverlay/staticOverlay.types"

const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"
export const vectorStyle = `https://api.maptiler.com/maps/a4824657-3edd-4fbd-925e-1af40ab06e9c/style.json?key=${maptilerApiKey}`
const satelliteStyle = `https://api.maptiler.com/maps/hybrid/style.json?key=${maptilerApiKey}`

export type BaseMapProps = Required<Pick<MapProps, "id" | "initialViewState">> &
  Partial<
    Pick<
      MapProps,
      | "onMouseEnter"
      | "onMouseMove"
      | "onMouseLeave"
      | "onClick"
      | "onZoomEnd"
      | "onLoad"
      | "interactiveLayerIds"
      | "hash"
      | "reuseMaps"
    >
  > &
  Omit<LinesLayerProps, "layerIdSuffix" | "interactive" | "lines"> &
  Partial<Pick<LinesLayerProps, "lines">> &
  Omit<PolygonsLayerProps, "layerIdSuffix" | "interactive" | "polygons"> &
  Partial<Pick<PolygonsLayerProps, "polygons">> &
  Omit<PointsLayerProps, "layerIdSuffix" | "interactive" | "points"> &
  Partial<Pick<PointsLayerProps, "points">> &
  Omit<LineEndPointsLayerProps, "layerIdSuffix" | "lineEndPoints"> &
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
  onMouseEnter,
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

  // Map layer source IDs - shared across all handlers (still needed for selected state)
  const sourceIds = {
    line: getLineLayerId(selectableLayerIdSuffix),
    polygon: getPolygonLayerId(selectableLayerIdSuffix),
    point: getPointLayerId(selectableLayerIdSuffix),
    endPoints: getLineEndPointsLayerId(selectableLayerIdSuffix),
  }

  // Build feature map grouped by slug (only needed for selected state, not hover)
  // This allows highlighting all features belonging to the same subsubsection/subsection
  type SlugFeatureIds = {
    lineIds: string[]
    polygonIds: string[]
    pointIds: string[]
    endPointIds: string[]
  }
  const slugFeatureMap = new Map<string, SlugFeatureIds>()

  const getSlug = (props: { subsubsectionSlug?: string; subsectionSlug?: string }) =>
    props.subsubsectionSlug || props.subsectionSlug

  // Process lines
  if (lines) {
    lines.features.forEach((f) => {
      const slug = getSlug(f.properties || {})
      const featureId = f.properties?.featureId
      if (slug && featureId) {
        const featureIds = slugFeatureMap.get(slug) ?? {
          lineIds: [],
          polygonIds: [],
          pointIds: [],
          endPointIds: [],
        }
        featureIds.lineIds.push(featureId)
        slugFeatureMap.set(slug, featureIds)
      }
    })
  }

  // Process polygons
  if (polygons) {
    polygons.features.forEach((f) => {
      const slug = getSlug(f.properties || {})
      const featureId = f.properties?.featureId
      if (slug && featureId) {
        const featureIds = slugFeatureMap.get(slug) ?? {
          lineIds: [],
          polygonIds: [],
          pointIds: [],
          endPointIds: [],
        }
        featureIds.polygonIds.push(featureId)
        slugFeatureMap.set(slug, featureIds)
      }
    })
  }

  // Process points
  if (points) {
    points.features.forEach((f) => {
      const slug = getSlug(f.properties || {})
      const featureId = f.properties?.featureId
      if (slug && featureId) {
        const featureIds = slugFeatureMap.get(slug) ?? {
          lineIds: [],
          polygonIds: [],
          pointIds: [],
          endPointIds: [],
        }
        featureIds.pointIds.push(featureId)
        slugFeatureMap.set(slug, featureIds)
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
        const featureIds = slugFeatureMap.get(lineIdStr) ?? {
          lineIds: [],
          polygonIds: [],
          pointIds: [],
          endPointIds: [],
        }
        featureIds.endPointIds.push(featureId)
        slugFeatureMap.set(lineIdStr, featureIds)
      }
    })
  }

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

    // Reset selected state for ALL features in all sources
    if (lines) {
      lines.features.forEach((f) => {
        const featureId = f.properties?.featureId
        if (featureId) {
          map.setFeatureState({ source: sourceIds.line, id: featureId }, { selected: false })
        }
      })
    }

    if (polygons) {
      polygons.features.forEach((f) => {
        const featureId = f.properties?.featureId
        if (featureId) {
          map.setFeatureState({ source: sourceIds.polygon, id: featureId }, { selected: false })
        }
      })
    }

    if (points) {
      points.features.forEach((f) => {
        const featureId = f.properties?.featureId
        if (featureId) {
          map.setFeatureState({ source: sourceIds.point, id: featureId }, { selected: false })
        }
      })
    }

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
        // Set selected on all features from this subsubsection/subsection
        featureIds.lineIds.forEach((id) => {
          map.setFeatureState({ source: sourceIds.line, id }, { selected: true })
        })

        featureIds.polygonIds.forEach((id) => {
          map.setFeatureState({ source: sourceIds.polygon, id }, { selected: true })
        })

        featureIds.pointIds.forEach((id) => {
          map.setFeatureState({ source: sourceIds.point, id }, { selected: true })
        })

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

  // Build interactive layer IDs
  const ids: string[] = []

  // Normalize external interactiveLayerIds to array
  if (interactiveLayerIds) {
    const normalized = Array.isArray(interactiveLayerIds)
      ? interactiveLayerIds
      : [interactiveLayerIds]
    ids.push(...normalized)
  }

  // Add visual layers for hover interaction (they share the same source as click-targets)
  if (lines) {
    const lineLayerId = getLineLayerId(selectableLayerIdSuffix)
    ids.push(
      `${lineLayerId}-solid`,
      `${lineLayerId}-dashed`,
      `${lineLayerId}-outline`,
      `${lineLayerId}-bg`,
    )
    // Also add click-target for better click detection
    ids.push(`${lineLayerId}-click-target`)
  }
  if (polygons) {
    const polygonLayerId = getPolygonLayerId(selectableLayerIdSuffix)
    ids.push(
      `${polygonLayerId}-fill`,
      `${polygonLayerId}-outline`,
      `${polygonLayerId}-dashed-outline`,
      `${polygonLayerId}-bg-outline`,
    )
    // Also add click-target for better click detection
    ids.push(`${polygonLayerId}-click-target`)
  }
  if (points) {
    const pointLayerId = getPointLayerId(selectableLayerIdSuffix)
    ids.push(pointLayerId, `${pointLayerId}-bg`, `${pointLayerId}-dashed`)
    // Also add click-target for better click detection
    ids.push(`${pointLayerId}-click-target`)
  }
  if (lineEndPoints) {
    const endPointsLayerId = getLineEndPointsLayerId(selectableLayerIdSuffix)
    ids.push(endPointsLayerId)
  }

  const allInteractiveLayerIds = ids

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
          interactiveLayerIds={allInteractiveLayerIds}
          hash={hash || false}
        >
          <NavigationControl showCompass={false} />
          <ScaleControl />
          {staticOverlay && <StaticOverlay config={staticOverlay} />}
          {lines && (
            <LinesLayer
              lines={lines}
              layerIdSuffix={selectableLayerIdSuffix}
              interactive={true}
              colorSchema={colorSchema}
            />
          )}
          {polygons && (
            <PolygonsLayer
              polygons={polygons}
              layerIdSuffix={selectableLayerIdSuffix}
              interactive={true}
              colorSchema={colorSchema}
            />
          )}
          {points && (
            <PointsLayer
              points={points}
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
