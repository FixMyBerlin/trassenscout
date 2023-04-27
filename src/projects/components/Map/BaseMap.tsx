import React, { useState } from "react"
import { MapProps } from "react-map-gl/src/components/map"
import Map, { Layer, NavigationControl, ScaleControl, Source } from "react-map-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { FeatureCollection } from "@turf/helpers"

import { BackgroundSwitcher, LayerType } from "./BackgroundSwitcher"

export interface BaseMapProps extends MapProps {
  isInteractive?: boolean
  features?: FeatureCollection
  selectableFeatures?: FeatureCollection
  dots?: FeatureCollection
}

const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"
const vectorStyle = `https://api.maptiler.com/maps/a4824657-3edd-4fbd-925e-1af40ab06e9c/style.json?key=${maptilerApiKey}`
const satelliteStyle = `https://api.maptiler.com/maps/hybrid/style.json?key=${maptilerApiKey}`
const selectableLayerId = "layer_selectable_features"

export const BaseMap: React.FC<BaseMapProps> = ({
  children,
  isInteractive,
  onMouseEnter,
  onMouseLeave,
  features,
  selectableFeatures,
  dots,
  interactiveLayerIds,
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
    // @ts-ignore
    <Source key="dots" type="geojson" data={dots}>
      <Layer type="circle" paint={{ "circle-color": "RGB(15, 23, 42)", "circle-radius": 6 }} />
    </Source>
  ) : null

  const featuresSource = features ? (
    // @ts-ignore
    <Source key="lines" type="geojson" data={features}>
      <Layer
        type="line"
        paint={{
          "line-width": 7,
          "line-color": ["get", "color"],
          "line-color-transition": { duration: 0 },
        }}
      />
    </Source>
  ) : null

  let allInteractiveLayerIds: string[] = []
  if (interactiveLayerIds) allInteractiveLayerIds = [...interactiveLayerIds]
  if (selectableFeatures) allInteractiveLayerIds = [...allInteractiveLayerIds, selectableLayerId]
  const selectableFeaturesSource = selectableFeatures ? (
    // @ts-ignore
    <Source key="selectable_lines" type="geojson" data={selectableFeatures}>
      <Layer
        id={selectableLayerId}
        type="line"
        paint={{
          "line-width": 7,
          "line-color": ["get", "color"],
          "line-color-transition": { duration: 0 },
        }}
      />
    </Source>
  ) : null

  return (
    <div className="h-[500px] w-full drop-shadow-md">
      <div className="relative h-full w-full">
        {/* @ts-ignore */}
        <Map
          mapStyle={selectedLayer === "vector" ? vectorStyle : satelliteStyle}
          scrollZoom={false}
          cursor={cursorStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          interactiveLayerIds={allInteractiveLayerIds}
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
