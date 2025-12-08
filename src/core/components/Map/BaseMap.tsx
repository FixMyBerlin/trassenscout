import { clsx } from "clsx"
import "maplibre-gl/dist/maplibre-gl.css"
import { useState } from "react"
import Map, {
  MapEvent,
  MapLayerMouseEvent,
  MapProps,
  NavigationControl,
  ScaleControl,
  ViewStateChangeEvent,
} from "react-map-gl/maplibre"
import { BackgroundSwitcher, LayerType } from "./BackgroundSwitcher"
import { DotsLayer, type DotsLayerProps } from "./layers/DotsLayer"
import { LinesLayer, type LinesLayerProps } from "./layers/LinesLayer"
import { PolygonsLayer, type PolygonsLayerProps } from "./layers/PolygonsLayer"
import {
  getSelectableLineLayerId,
  SelectableLinesLayer,
  type SelectableLinesLayerProps,
} from "./layers/SelectableLinesLayer"
import {
  getSelectablePointLayerId,
  SelectablePointsLayer,
  type SelectablePointsLayerProps,
} from "./layers/SelectablePointsLayer"
import {
  getSelectablePolygonLayerId,
  SelectablePolygonsLayer,
  type SelectablePolygonsLayerProps,
} from "./layers/SelectablePolygonsLayer"

const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"
export const vectorStyle = `https://api.maptiler.com/maps/a4824657-3edd-4fbd-925e-1af40ab06e9c/style.json?key=${maptilerApiKey}`
const satelliteStyle = `https://api.maptiler.com/maps/hybrid/style.json?key=${maptilerApiKey}`

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
  LinesLayerProps &
  PolygonsLayerProps &
  SelectableLinesLayerProps &
  SelectablePointsLayerProps &
  SelectablePolygonsLayerProps &
  DotsLayerProps & {
    classHeight?: string
    children?: React.ReactNode
    backgroundSwitcherPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
    selectableLayerIdSuffix?: string
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
  selectableLines,
  selectablePoints,
  selectablePolygons,
  dots,
  classHeight,
  children,
  backgroundSwitcherPosition = "top-left",
  selectableLayerIdSuffix,
}: BaseMapProps) => {
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")
  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }

  const [cursorStyle, setCursorStyle] = useState("grab")
  const handleMouseEnter = (e: MapLayerMouseEvent) => {
    if (onMouseEnter) onMouseEnter(e)
    setCursorStyle("pointer")
  }
  const handleMouseLeave = (e: MapLayerMouseEvent) => {
    if (onMouseLeave) onMouseLeave(e)
    setCursorStyle("grab")
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
        <Map
          id={mapId}
          reuseMaps
          initialViewState={initialViewState}
          mapStyle={selectedLayer === "vector" ? vectorStyle : satelliteStyle}
          scrollZoom={false}
          cursor={cursorStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={onClick}
          onZoomEnd={handleZoomEnd}
          onLoad={handleOnLoad}
          interactiveLayerIds={[
            interactiveLayerIds,
            selectablePoints &&
              `${getSelectablePointLayerId(selectableLayerIdSuffix)}-click-target`,
            selectableLines && `${getSelectableLineLayerId(selectableLayerIdSuffix)}-click-target`,
            selectablePolygons &&
              `${getSelectablePolygonLayerId(selectableLayerIdSuffix)}-click-target`,
          ]
            .flat()
            .filter(Boolean)}
          hash={hash || false}
        >
          <NavigationControl showCompass={false} />
          <ScaleControl />
          <LinesLayer lines={lines} />
          <PolygonsLayer polygons={polygons} />
          <SelectableLinesLayer
            selectableLines={selectableLines}
            layerIdSuffix={selectableLayerIdSuffix}
          />
          <SelectablePointsLayer
            selectablePoints={selectablePoints}
            layerIdSuffix={selectableLayerIdSuffix}
          />
          <SelectablePolygonsLayer
            selectablePolygons={selectablePolygons}
            layerIdSuffix={selectableLayerIdSuffix}
          />
          <DotsLayer dots={dots} />
          {children}
        </Map>
        <BackgroundSwitcher
          position={backgroundSwitcherPosition}
          value={selectedLayer}
          onChange={handleLayerSwitch}
        />
      </div>
    </div>
  )
}
