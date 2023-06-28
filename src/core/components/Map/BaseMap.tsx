import { FeatureCollection, LineString, Point, featureCollection, point } from "@turf/helpers"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import React, { useState } from "react"
import Map, {
  Layer,
  MapProps,
  NavigationControl,
  ScaleControl,
  Source,
  ViewStateChangeEvent,
} from "react-map-gl"
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
      "onMouseEnter" | "onMouseLeave" | "onClick" | "onZoomEnd" | "interactiveLayerIds" | "hash"
    >
  > & {
    lines?: FeatureCollection<LineString, { color: string; width?: number; opacity?: number }>
    selectableLines?: FeatureCollection<
      LineString,
      { subsectionSlug: string; subsubsectionSlug?: string; color: string; opacity?: number }
    >
    selectablePoints?: FeatureCollection<
      Point,
      { subsectionSlug: string; subsubsectionSlug?: string; color: string; opacity?: number }
    >
    dots: [number, number][]
    children: React.ReactNode
  }

export const BaseMap: React.FC<BaseMapProps> = ({
  id: mapId,
  initialViewState,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onZoomEnd,
  interactiveLayerIds,
  hash,
  lines,
  selectableLines,
  selectablePoints,
  dots,
  children,
}) => {
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")
  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }

  const [cursorStyle, setCursorStyle] = useState("grab")
  const handleMouseEnter = (e: mapboxgl.MapLayerMouseEvent) => {
    if (onMouseEnter) onMouseEnter(e)
    setCursorStyle("pointer")
  }
  const handleMouseLeave = (e: mapboxgl.MapLayerMouseEvent) => {
    if (onMouseLeave) onMouseLeave(e)
    setCursorStyle("grab")
  }
  const handleZoomEnd = (e: ViewStateChangeEvent) => {
    if (onZoomEnd) onZoomEnd(e)
  }

  const dotSource = dots ? (
    <Source key="dots" type="geojson" data={featureCollection(dots.map((d) => point(d)))}>
      <Layer type="circle" paint={{ "circle-color": "RGB(15, 23, 42)", "circle-radius": 6 }} />
    </Source>
  ) : null

  const featuresSource = lines ? (
    <Source key="lines" type="geojson" data={lines}>
      <Layer
        type="line"
        paint={{
          "line-width": ["case", ["has", "width"], ["get", "width"], 7],
          "line-color": ["case", ["has", "color"], ["get", "color"], "black"],
          "line-color-transition": { duration: 0 },
          "line-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 1],
        }}
      />
    </Source>
  ) : null

  const selectableLineFeaturesSource = selectableLines ? (
    <Source key={selectableLineLayerId} type="geojson" data={selectableLines}>
      <Layer
        id={selectableLineLayerId}
        type="line"
        paint={{
          "line-width": 7,
          "line-color": ["case", ["has", "color"], ["get", "color"], "black"],
          "line-color-transition": { duration: 0 },
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
          "circle-radius": 17,
          "circle-color": ["case", ["has", "color"], ["get", "color"], "black"],
          "circle-color-transition": { duration: 0 },
          "circle-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 1],
        }}
      />
    </Source>
  ) : null

  return (
    <div className="h-96 w-full overflow-clip rounded-md drop-shadow-md sm:h-[500px]">
      <div className="relative h-full w-full">
        <Map
          id={mapId}
          reuseMaps
          initialViewState={initialViewState}
          mapLib={maplibregl}
          mapStyle={selectedLayer === "vector" ? vectorStyle : satelliteStyle}
          scrollZoom={false}
          cursor={cursorStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={onClick}
          onZoomEnd={handleZoomEnd}
          interactiveLayerIds={[
            interactiveLayerIds,
            selectableLines && selectableLineLayerId,
            selectablePoints && selectablePointLayerId,
          ]
            .flat()
            .filter(Boolean)}
          hash={hash || false}
        >
          <NavigationControl showCompass={false} />
          <ScaleControl />
          {children}
          {featuresSource}
          {selectableLineFeaturesSource}
          {selectablePointFeaturesSource}
          {dotSource}
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
