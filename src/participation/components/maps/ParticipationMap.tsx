import { multiLineString, MultiLineString } from "@turf/helpers"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import React, { useCallback, useEffect, useState } from "react"
import Map, {
  Layer,
  LngLat,
  LngLatBoundsLike,
  Marker,
  MarkerDragEvent,
  NavigationControl,
  Source,
  useMap,
} from "react-map-gl"
import { LayerType } from "src/projects/components/Map/BackgroundSwitcher"
import { MapBanner } from "./MapBanner"
import { ParticipationBackgroundSwitcher } from "./ParticipationBackgroundSwitcher"
import Pin from "./Pin"

export type ParticipationMapProps = {
  className?: string
  children?: React.ReactNode
  projectMap: {
    projectGeometry: MultiLineString
    marker: { lng: number; lat: number }
    config: {
      zoom: number
      bounds: LngLatBoundsLike
      longitude: number
      latitude: number
      boundsPadding: number
    }
  }
}

export const ParticipationMap: React.FC<ParticipationMapProps> = ({
  projectMap,
  className,
  children,
}) => {
  const { mainMap } = useMap()
  const [marker, setMarker] = useState(projectMap.marker)
  const [events, logEvents] = useState<Record<string, LngLat>>({})
  const [isPinInView, setIsPinInView] = useState(true)

  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")
  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }

  const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"
  const vectorStyle = `https://api.maptiler.com/maps/a4824657-3edd-4fbd-925e-1af40ab06e9c/style.json?key=${maptilerApiKey}`
  const satelliteStyle = `https://api.maptiler.com/maps/hybrid/style.json?key=${maptilerApiKey}`

  const handleClick = async (e: mapboxgl.MapLayerMouseEvent) => {}

  useEffect(() => {
    if (!mainMap) return
    // mainMap.fitBounds(sectionBounds, { padding: 60 })
  }, [mainMap])

  const onMarkerDragStart = useCallback((event: MarkerDragEvent) => {
    logEvents((_events) => ({ ..._events, onDragStart: event.lngLat }))
  }, [])

  const onMarkerDrag = useCallback((event: MarkerDragEvent) => {
    logEvents((_events) => ({ ..._events, onDrag: event.lngLat }))

    setMarker({
      lng: event.lngLat.lng,
      lat: event.lngLat.lat,
    })
  }, [])

  const onMarkerDragEnd = useCallback((event: MarkerDragEvent) => {
    logEvents((_events) => ({ ..._events, onDragEnd: event.lngLat }))
  }, [])

  const checkPinInView = () => {
    if (mainMap && mainMap?.getBounds().contains(marker)) {
      setIsPinInView(true)
    } else {
      setIsPinInView(false)
    }
  }

  const easeToPin = () => {
    mainMap?.easeTo({
      center: [marker.lng, marker.lat],
      duration: 1000,
    })
  }

  const handleMapMove = () => {
    checkPinInView()
  }
  const handleMapZoom = () => {
    checkPinInView()
  }

  const { config } = projectMap

  return (
    <div className="h-[500px]">
      <Map
        id="mainMap"
        mapLib={maplibregl}
        initialViewState={{
          longitude: config.longitude,
          latitude: config.latitude,
          zoom: config.zoom,
          bounds: config.bounds,
          fitBoundsOptions: {
            padding: config.boundsPadding,
          },
        }}
        scrollZoom={false}
        onMove={handleMapMove}
        mapStyle={selectedLayer === "vector" ? vectorStyle : satelliteStyle}
        onClick={handleClick}
        onZoom={handleMapZoom}
      >
        {children}
        <Marker
          longitude={marker.lng}
          latitude={marker.lat}
          anchor="bottom"
          draggable
          onDragStart={onMarkerDragStart}
          onDrag={onMarkerDrag}
          onDragEnd={onMarkerDragEnd}
        >
          <Pin />
          <Source type="geojson" data={multiLineString(projectMap.projectGeometry.coordinates)}>
            <Layer
              type="line"
              paint={{
                "line-width": 7,
                "line-color": "blue",
              }}
            />
          </Source>
        </Marker>
        <NavigationControl showCompass={false} />
        {/* <ScaleControl /> */}
        <MapBanner
          className="absolute bottom-12"
          action={easeToPin}
          status={isPinInView ? "default" : "pinOutOfView"}
        />
        <ParticipationBackgroundSwitcher
          className="absolute top-4 left-4"
          value={selectedLayer}
          onChange={handleLayerSwitch}
        />
      </Map>
    </div>
  )
}
