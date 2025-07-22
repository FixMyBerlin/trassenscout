import { layerColors } from "@/src/core/components/Map/layerColors"
import { featureCollection, point } from "@turf/helpers"
import { clsx } from "clsx"
import type { FeatureCollection, LineString, Point } from "geojson"
import "maplibre-gl/dist/maplibre-gl.css"
import { useState } from "react"
import Map, {
  Layer,
  MapEvent,
  MapLayerMouseEvent,
  MapProps,
  NavigationControl,
  ScaleControl,
  Source,
  ViewStateChangeEvent,
} from "react-map-gl/maplibre"
import { BackgroundSwitcher, LayerType } from "./BackgroundSwitcher"

const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"
export const vectorStyle = `https://api.maptiler.com/maps/a4824657-3edd-4fbd-925e-1af40ab06e9c/style.json?key=${maptilerApiKey}`
const satelliteStyle = `https://api.maptiler.com/maps/hybrid/style.json?key=${maptilerApiKey}`
const selectableLineLayerId = "layer_selectable_line_features"
const selectablePointLayerId = "layer_selectable_point_features"

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
  > & {
    lines?: FeatureCollection<
      LineString,
      {
        color?: string
        width?: number
        opacity?: number
      }
    >
    selectableLines?: FeatureCollection<
      LineString,
      | { subsectionSlug: string; subsubsectionSlug?: string; color: string; opacity?: number }
      | { projectSlug: string; color: string; opacity?: number }
    >
    selectablePoints?: FeatureCollection<
      Point,
      { subsectionSlug: string; subsubsectionSlug?: string; color: string; opacity?: number }
    >
    dots?: [number, number][]
    classHeight?: string
    children?: React.ReactNode
  }

export const BaseMap: React.FC<BaseMapProps> = ({
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
  selectableLines,
  selectablePoints,
  dots,
  classHeight,
  children,
}) => {
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

  const dotSource = dots ? (
    <Source key="dots" type="geojson" data={featureCollection(dots.map((d) => point(d)))}>
      <Layer type="circle" paint={{ "circle-color": layerColors.dot, "circle-radius": 6 }} />
    </Source>
  ) : null

  const featuresSource = lines ? (
    <Source key="lines" type="geojson" data={lines}>
      {/* Background outline layer */}
      <Layer
        id="lines-outline"
        type="line"
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
        paint={{
          "line-width": 9,
          "line-color": layerColors.dot,
          "line-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 0.6],
        }}
      />
      {/* Main colored line layer */}
      <Layer
        type="line"
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
        paint={{
          "line-width": ["case", ["has", "width"], ["get", "width"], 7],
          "line-color": ["case", ["has", "color"], ["get", "color"], "black"],
          "line-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 1],
        }}
      />
    </Source>
  ) : null

  const selectableLineFeaturesSource = selectableLines ? (
    <Source key={selectableLineLayerId} type="geojson" data={selectableLines}>
      {/* Background outline layer */}
      <Layer
        id={`${selectableLineLayerId}-outline`}
        type="line"
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
        paint={{
          "line-width": 9,
          "line-color": layerColors.dot,
          "line-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 0.6],
        }}
      />
      {/* Main colored line layer */}
      <Layer
        id={selectableLineLayerId}
        type="line"
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
        paint={{
          "line-width": 7,
          "line-color": ["case", ["has", "color"], ["get", "color"], "black"],
          "line-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 1],
        }}
      />
    </Source>
  ) : null

  const selectablePointFeaturesSource = selectablePoints ? (
    <Source key={selectablePointLayerId} type="geojson" data={selectablePoints}>
      <Layer
        id={selectablePointLayerId}
        type="circle"
        paint={{
          "circle-radius": ["case", ["has", "radius"], ["get", "radius"], 17],
          "circle-color": ["case", ["has", "color"], ["get", "color"], "black"],
          "circle-stroke-width": ["case", ["has", "border-width"], ["get", "border-width"], 0],
          "circle-stroke-color": [
            "case",
            ["has", "border-color"],
            ["get", "border-color"],
            "transparent",
          ],
          "circle-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 1],
        }}
      />
    </Source>
  ) : null

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
            selectablePoints && selectablePointLayerId,
            selectableLines && selectableLineLayerId,
          ]
            .flat()
            .filter(Boolean)}
          hash={hash || false}
        >
          <NavigationControl showCompass={false} />
          <ScaleControl />
          {featuresSource}
          {selectableLineFeaturesSource}
          {selectablePointFeaturesSource}
          {dotSource}
          {children}
        </Map>
        <BackgroundSwitcher
          className="absolute left-4 top-4"
          value={selectedLayer}
          onChange={handleLayerSwitch}
        />
      </div>
    </div>
  )
}
