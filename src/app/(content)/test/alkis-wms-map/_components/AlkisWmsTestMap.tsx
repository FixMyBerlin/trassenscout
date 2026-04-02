"use client"

import { BackgroundSwitcher, type LayerType } from "@/src/core/components/Map/BackgroundSwitcher"
import { getMapStyle } from "@/src/core/components/Map/mapStyleConfig"
import "maplibre-gl/dist/maplibre-gl.css"
import { useMemo, useRef, useState } from "react"
import Map, { Layer, NavigationControl, ScaleControl, Source, type MapRef } from "react-map-gl/maplibre"

const MIN_WMS_ZOOM = 14

const BERLIN_WMS_BASE_URL = "https://gdi.berlin.de/services/wms/alkis_flurstuecke"
const BERLIN_WMS_LAYER_NAME = "flurstuecke"

const BERLIN_WMS_TILES = [
  `${BERLIN_WMS_BASE_URL}?` +
    "SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap" +
    `&LAYERS=${encodeURIComponent(BERLIN_WMS_LAYER_NAME)}` +
    "&STYLES=" +
    "&FORMAT=image/png" +
    "&TRANSPARENT=true" +
    "&CRS=EPSG:3857" +
    "&WIDTH=256&HEIGHT=256" +
    "&BBOX={bbox-epsg-3857}",
]

export function AlkisWmsTestMap() {
  const mapRef = useRef<MapRef | null>(null)

  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")
  const [zoom, setZoom] = useState<number>(15)
  const [opacity, setOpacity] = useState<number>(0.8)

  const mapStyle = useMemo(() => getMapStyle(selectedLayer), [selectedLayer])

  const showZoomHint = zoom < MIN_WMS_ZOOM

  return (
    <div className="relative w-full overflow-clip rounded-md border border-gray-200 shadow-sm">
      <div className="h-[520px] w-full">
        <Map
          ref={(instance) => {
            mapRef.current = instance
          }}
          initialViewState={{
            latitude: 52.520008,
            longitude: 13.404954,
            zoom: 15,
          }}
          mapStyle={mapStyle}
          onLoad={() => {
            const map = mapRef.current?.getMap()
            if (map) setZoom(map.getZoom())
          }}
          onMoveEnd={() => {
            const map = mapRef.current?.getMap()
            if (map) setZoom(map.getZoom())
          }}
        >
          <NavigationControl showCompass={false} />
          <ScaleControl />

          <Source
            id="alkis-wms"
            type="raster"
            tiles={BERLIN_WMS_TILES}
            tileSize={256}
            minzoom={MIN_WMS_ZOOM}
          >
            <Layer
              id="alkis-wms-layer"
              type="raster"
              paint={{
                "raster-opacity": opacity,
              }}
            />
          </Source>
        </Map>
      </div>

      <BackgroundSwitcher
        position="top-left"
        value={selectedLayer}
        onChange={(layer) => {
          setSelectedLayer(layer)
        }}
      />

      <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex flex-col gap-2">
        <div className="pointer-events-auto inline-flex w-fit items-center gap-2 rounded-md bg-white/90 px-3 py-2 text-xs text-gray-700 shadow-sm ring-1 ring-gray-200">
          <span className="font-medium">Quelle:</span>
          <span>© Geoportal Berlin / ALKIS</span>
          <span className="mx-2 text-gray-300">|</span>
          <span className="font-medium">WMS:</span>
          <span className="truncate">{BERLIN_WMS_BASE_URL}</span>
        </div>

        <div className="pointer-events-auto inline-flex w-fit flex-wrap items-center gap-2 rounded-md bg-white/90 px-3 py-2 text-xs text-gray-700 shadow-sm ring-1 ring-gray-200">
          <label className="inline-flex items-center gap-2">
            <span className="font-medium">Deckkraft</span>
            <input
              className="pointer-events-auto"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) => {
                setOpacity(Number(e.target.value))
              }}
            />
            <span className="tabular-nums">{Math.round(opacity * 100)}%</span>
          </label>

          {showZoomHint && (
            <span className="text-amber-700">
              Zoome näher ran (Zoom ≥ {MIN_WMS_ZOOM}), damit der WMS-Layer geladen wird.
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

