import React, { useState } from "react"
import Map, { Layer, MapProps, NavigationControl, ScaleControl, Source } from "react-map-gl"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { Feature, FeatureCollection, LineString } from "@turf/helpers"

import { BackgroundSwitcher, LayerType } from "./BackgroundSwitcher"

export interface BaseMapProps extends MapProps {
  lines?: FeatureCollection
  selectableLines?: FeatureCollection
  dots?: Feature<LineString>
}

const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"
const vectorStyle = `https://api.maptiler.com/maps/a4824657-3edd-4fbd-925e-1af40ab06e9c/style.json?key=${maptilerApiKey}`
const satelliteStyle = `https://api.maptiler.com/maps/hybrid/style.json?key=${maptilerApiKey}`
const selectableLayerId = "layer_selectable_features"

export const BaseMap: React.FC<BaseMapProps> = ({
  children,
  onMouseEnter,
  onMouseLeave,
  lines,
  selectableLines,
  dots,
  ...mapProps
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
    // @ts-ignore
    <Source key="dots" type="geojson" data={dots}>
      <Layer type="circle" paint={{ "circle-color": "RGB(15, 23, 42)", "circle-radius": 6 }} />
    </Source>
  ) : null

  const featuresSource = lines ? (
    // @ts-ignore
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
    // @ts-ignore
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
        {/* @ts-ignore */}
        <Map
          reuseMaps
          mapLib={maplibregl}
          mapStyle={selectedLayer === "vector" ? vectorStyle : satelliteStyle}
          scrollZoom={false}
          cursor={cursorStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          interactiveLayerIds={selectableLines ? [selectableLayerId] : undefined}
          {...mapProps}
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
