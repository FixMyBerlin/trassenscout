import { FeatureCollection, LineString, featureCollection, point } from "@turf/helpers"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import React, { useState } from "react"
import Map, { Layer, MapProps, NavigationControl, ScaleControl, Source } from "react-map-gl"
import { BackgroundSwitcher, LayerType } from "./BackgroundSwitcher"

const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"
export const vectorStyle = `https://api.maptiler.com/maps/a4824657-3edd-4fbd-925e-1af40ab06e9c/style.json?key=${maptilerApiKey}`
const satelliteStyle = `https://api.maptiler.com/maps/hybrid/style.json?key=${maptilerApiKey}`
const selectableLayerId = "layer_selectable_features"

export type BaseMapProps = Required<
  Pick<MapProps, "id" | "initialViewState" | "onMouseEnter" | "onMouseLeave" | "onClick">
> & {
  lines?: FeatureCollection<
    LineString,
    {
      color: string
    }
  >
  selectableLines: FeatureCollection<
    LineString,
    {
      id: string
      color: string
    }
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
  lines,
  selectableLines,
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
          "line-width": 7,
          "line-color": ["case", ["has", "color"], ["get", "color"], "black"],
          "line-color-transition": { duration: 0 },
          "line-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 1],
        }}
      />
    </Source>
  ) : null

  const selectableFeaturesSource = selectableLines ? (
    <Source key="selectable_lines" type="geojson" data={selectableLines}>
      <Layer
        id={selectableLayerId}
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

  return (
    <div className="h-[500px] w-full overflow-clip rounded-md drop-shadow-md">
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
          interactiveLayerIds={selectableLines ? [selectableLayerId] : undefined}
        >
          <NavigationControl showCompass={false} />
          <ScaleControl />
          {children}
          {featuresSource}
          {selectableFeaturesSource}
          {dotSource}
        </Map>
        <BackgroundSwitcher
          className="absolute top-4 left-4"
          value={selectedLayer}
          onChange={handleLayerSwitch}
        />
      </div>
    </div>
  )
}
