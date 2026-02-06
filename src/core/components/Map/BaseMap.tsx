import { clsx } from "clsx"
import type { Map as MapLibreMap } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { createContext, useContext, useState } from "react"
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

const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"
export const vectorStyle = `https://api.maptiler.com/maps/a4824657-3edd-4fbd-925e-1af40ab06e9c/style.json?key=${maptilerApiKey}`
const satelliteStyle = `https://api.maptiler.com/maps/hybrid/style.json?key=${maptilerApiKey}`

type MapHighlightContextValue = {
  highlightFeaturesBySlug: (map: MapLibreMap, slug: string) => void
  clearHoverState: (map: MapLibreMap) => void
}

const MapHighlightContext = createContext<MapHighlightContextValue | null>(null)

export const useMapHighlight = () => {
  const context = useContext(MapHighlightContext)
  if (!context) {
    throw new Error("useMapHighlight must be used within BaseMap")
  }
  return context
}

export type BaseMapProps = Required<Pick<MapProps, "id" | "initialViewState">> &
  Partial<
    Pick<
      MapProps,
      | "onMouseEnter"
      | "onMouseLeave"
      | "onClick"
      | "onZoomEnd"
      | "onLoad"
      | "interactiveLayerIds"
      | "hash"
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
    backgroundSwitcherPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
    selectableLayerIdSuffix?: string // Defaults to "" if not provided
    colorSchema: "subsection" | "subsubsection"
  }

export const BaseMap = ({
  id: mapId,
  initialViewState,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onZoomEnd,
  onLoad,
  interactiveLayerIds,
  hash,
  lines,
  polygons,
  points,
  lineEndPoints,
  classHeight,
  children,
  backgroundSwitcherPosition = "top-left",
  selectableLayerIdSuffix = "",
  colorSchema,
}: BaseMapProps) => {
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")
  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }

  const [cursorStyle, setCursorStyle] = useState("grab")

  // Map layer source IDs - shared across all handlers
  const sourceIds = {
    line: getLineLayerId(selectableLayerIdSuffix),
    polygon: getPolygonLayerId(selectableLayerIdSuffix),
    point: getPointLayerId(selectableLayerIdSuffix),
    endPoints: getLineEndPointsLayerId(selectableLayerIdSuffix),
  }

  // Build feature map grouped by slug (subsubsectionSlug or subsectionSlug)
  // This allows highlighting all features belonging to the same subsubsection/subsection
  type SlugFeatureIds = {
    lineIds: string[]
    polygonIds: string[]
    pointIds: string[]
    endPointIds: string[]
  }
  const map = new Map<string, SlugFeatureIds>()

  const getSlug = (props: { subsubsectionSlug?: string; subsectionSlug?: string }) =>
    props.subsubsectionSlug || props.subsectionSlug

  // Process lines
  if (lines) {
    lines.features.forEach((f) => {
      const slug = getSlug(f.properties || {})
      const featureId = f.properties?.featureId
      if (slug && featureId) {
        const featureIds = map.get(slug) ?? {
          lineIds: [],
          polygonIds: [],
          pointIds: [],
          endPointIds: [],
        }
        featureIds.lineIds.push(featureId)
        map.set(slug, featureIds)
      }
    })
  }

  // Process polygons
  if (polygons) {
    polygons.features.forEach((f) => {
      const slug = getSlug(f.properties || {})
      const featureId = f.properties?.featureId
      if (slug && featureId) {
        const featureIds = map.get(slug) ?? {
          lineIds: [],
          polygonIds: [],
          pointIds: [],
          endPointIds: [],
        }
        featureIds.polygonIds.push(featureId)
        map.set(slug, featureIds)
      }
    })
  }

  // Process points
  if (points) {
    points.features.forEach((f) => {
      const slug = getSlug(f.properties || {})
      const featureId = f.properties?.featureId
      if (slug && featureId) {
        const featureIds = map.get(slug) ?? {
          lineIds: [],
          polygonIds: [],
          pointIds: [],
          endPointIds: [],
        }
        featureIds.pointIds.push(featureId)
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
          lineIds: [],
          polygonIds: [],
          pointIds: [],
          endPointIds: [],
        }
        featureIds.endPointIds.push(featureId)
        map.set(lineIdStr, featureIds)
      }
    })
  }

  const slugFeatureMap = map

  // Helper function to highlight features by slug (used by both map hover and marker hover)
  const highlightFeaturesBySlug = (map: MapLibreMap, slug: string) => {
    const featureIds = slugFeatureMap.get(slug)
    if (featureIds) {
      // Set hover on all features from this subsubsection/subsection
      featureIds.lineIds.forEach((id) => {
        map.setFeatureState({ source: sourceIds.line, id }, { hover: true })
      })

      featureIds.polygonIds.forEach((id) => {
        map.setFeatureState({ source: sourceIds.polygon, id }, { hover: true })
      })

      featureIds.pointIds.forEach((id) => {
        map.setFeatureState({ source: sourceIds.point, id }, { hover: true })
      })

      featureIds.endPointIds.forEach((id) => {
        map.setFeatureState({ source: sourceIds.endPoints, id }, { hover: true })
      })
    }
  }

  // Helper function to clear hover state (used by both map hover and marker hover)
  const clearHoverState = (map: MapLibreMap) => {
    // Reset hover for ALL features in all sources using our GeoJSON data
    if (lines) {
      lines.features.forEach((f) => {
        const featureId = f.properties?.featureId
        if (featureId) {
          map.setFeatureState({ source: sourceIds.line, id: featureId }, { hover: false })
        }
      })
    }

    if (points) {
      points.features.forEach((f) => {
        const featureId = f.properties?.featureId
        if (featureId) {
          map.setFeatureState({ source: sourceIds.point, id: featureId }, { hover: false })
        }
      })
    }

    if (polygons) {
      polygons.features.forEach((f) => {
        const featureId = f.properties?.featureId
        if (featureId) {
          map.setFeatureState({ source: sourceIds.polygon, id: featureId }, { hover: false })
        }
      })
    }

    // Reset hover for endpoints
    if (lineEndPoints) {
      lineEndPoints.features.forEach((f) => {
        const featureId = f.properties?.featureId
        if (featureId) {
          map.setFeatureState({ source: sourceIds.endPoints, id: featureId }, { hover: false })
        }
      })
    }
  }

  // Context value for marker components
  const highlightContextValue = {
    highlightFeaturesBySlug,
    clearHoverState,
  }

  // Handle hover state via setFeatureState
  const handleMouseEnterInternal = (e: MapLayerMouseEvent) => {
    const map = e.target
    const features = e.features || []

    if (!map || features.length === 0) {
      setCursorStyle("grab")
      if (onMouseEnter) onMouseEnter(e)
      return
    }

    // Get the first feature
    const feature = features[0]
    const featureId = feature?.properties?.featureId
    if (!feature || !featureId || !feature.source) {
      setCursorStyle("grab")
      if (onMouseEnter) onMouseEnter(e)
      return
    }

    // Extract slug to find all matching features
    const rawSlug =
      feature.properties?.subsubsectionSlug ||
      feature.properties?.subsectionSlug ||
      feature.properties?.lineId
    const lookupSlug = rawSlug ? String(rawSlug) : undefined

    if (lookupSlug) {
      highlightFeaturesBySlug(map, lookupSlug)
    }

    setCursorStyle("pointer")
    if (onMouseEnter) onMouseEnter(e)
  }

  const handleMouseLeaveInternal = (e: MapLayerMouseEvent) => {
    const map = e.target
    if (!map) {
      setCursorStyle("grab")
      if (onMouseLeave) onMouseLeave(e)
      return
    }

    clearHoverState(map)

    setCursorStyle("grab")
    if (onMouseLeave) onMouseLeave(e)
  }

  // Handle selection state via setFeatureState
  const handleClickInternal = (e: MapLayerMouseEvent) => {
    const map = e.target
    const features = e.features || []
    if (!map || features.length === 0) {
      if (onClick) onClick(e)
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
    const rawSlug =
      feature?.properties?.subsubsectionSlug ||
      feature?.properties?.subsectionSlug ||
      feature?.properties?.lineId
    const lookupSlug = rawSlug ? String(rawSlug) : undefined

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
    if (onClick) onClick(e)
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
    const normalized = Array.isArray(interactiveLayerIds) ? interactiveLayerIds : [interactiveLayerIds]
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
          reuseMaps
          initialViewState={initialViewState}
          mapStyle={selectedLayer === "vector" ? vectorStyle : satelliteStyle}
          scrollZoom={false}
          cursor={cursorStyle}
          onMouseEnter={handleMouseEnterInternal}
          onMouseLeave={handleMouseLeaveInternal}
          onClick={handleClickInternal}
          onZoomEnd={handleZoomEnd}
          onLoad={handleOnLoad}
          interactiveLayerIds={allInteractiveLayerIds}
          hash={hash || false}
        >
          <NavigationControl showCompass={false} />
          <ScaleControl />
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
          <MapHighlightContext.Provider value={highlightContextValue}>
            {children}
          </MapHighlightContext.Provider>
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
