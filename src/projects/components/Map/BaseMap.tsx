import React, { useState } from "react"
import { MapProps } from "react-map-gl/src/components/map"
import Map, { Layer, MapProvider, NavigationControl, ScaleControl, Source } from "react-map-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { LineString } from "@turf/helpers"

import { BackgroundSwitcher, LayerType } from "./BackgroundSwitcher"

export interface BaseMapProps extends MapProps {
  isInteractive?: boolean
  dots?: LineString
}

const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"
const vectorStyle = `https://api.maptiler.com/maps/a4824657-3edd-4fbd-925e-1af40ab06e9c/style.json?key=${maptilerApiKey}`
const satelliteStyle = `https://api.maptiler.com/maps/hybrid/style.json?key=${maptilerApiKey}`

export const BaseMap: React.FC<BaseMapProps> = ({
  children,
  isInteractive,
  onMouseEnter,
  onMouseLeave,
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
    if (isInteractive) setCursorStyle("pointer")
  }
  const handleMouseLeave = (e: mapboxgl.MapLayerMouseEvent) => {
    if (onMouseLeave) onMouseLeave(e)
    if (isInteractive) setCursorStyle("grab")
  }

  const dotSource = dots ? (
    <>
      <Source key="source_dots" type="geojson" data={dots}>
        <Layer
          id={"layer_dots"}
          type="circle"
          paint={{ "circle-color": "RGB(15, 23, 42)", "circle-radius": 6 }}
        />
      </Source>
    </>
  ) : null

  return (
    <div className="h-[500px] w-full drop-shadow-md">
      <div className="relative h-full w-full">
        <MapProvider>
          {/* @ts-ignore */}
          <Map
            mapStyle={selectedLayer === "vector" ? vectorStyle : satelliteStyle}
            scrollZoom={false}
            cursor={cursorStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...mapProps}
          >
            <NavigationControl showCompass={false} />
            <ScaleControl />
            {children}
            {dotSource}
          </Map>
          <BackgroundSwitcher
            className="absolute top-4 left-4"
            value={selectedLayer}
            onChange={handleLayerSwitch}
          />
        </MapProvider>
      </div>
    </div>
  )
}
