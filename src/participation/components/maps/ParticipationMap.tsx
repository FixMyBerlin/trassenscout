import { multiLineString, MultiLineString } from "@turf/helpers"
import clsx from "clsx"
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
    initialMarker: { lng: number; lat: number }
    config: {
      bounds: LngLatBoundsLike
      minZoom?: number
      maxZoom?: number
    }
  }
}

export const ParticipationMap: React.FC<ParticipationMapProps> = ({
  projectMap,
  className,
  children,
}) => {
  const { mainMap } = useMap()
  const [marker, setMarker] = useState(projectMap.initialMarker)
  const [events, logEvents] = useState<Record<string, LngLat>>({})
  const [isPinInView, setIsPinInView] = useState(true)
  const [isMediumScreen, setIsMediumScreen] = useState(false)

  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")
  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }
  console.log(projectMap)
  const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"
  const vectorStyle = `https://api.maptiler.com/maps/a4824657-3edd-4fbd-925e-1af40ab06e9c/style.json?key=${maptilerApiKey}`
  const satelliteStyle = `https://api.maptiler.com/maps/hybrid/style.json?key=${maptilerApiKey}`

  const handleClick = async (e: mapboxgl.MapLayerMouseEvent) => {}

  useEffect(() => {
    if (!mainMap) return
  }, [mainMap])

  useEffect(() => {
    const lgMediaQuery = window.matchMedia("(min-width: 768px)")
    // @ts-ignore
    function onMediaQueryChange({ matches }) {
      setIsMediumScreen(matches)
    }
    onMediaQueryChange(lgMediaQuery)
    lgMediaQuery.addEventListener("change", onMediaQueryChange)
    return () => {
      lgMediaQuery.removeEventListener("change", onMediaQueryChange)
    }
  }, [])

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
    console.log(event)
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
    <div className={clsx(className, "h-[500px]")}>
      <Map
        id="mainMap"
        mapLib={maplibregl}
        initialViewState={{
          bounds: config.bounds,
        }}
        scrollZoom={false}
        onMove={handleMapMove}
        mapStyle={selectedLayer === "vector" ? vectorStyle : satelliteStyle}
        onClick={handleClick}
        onZoom={handleMapZoom}
      >
        {children}
        <Marker
          longitude={marker?.lng}
          latitude={marker?.lat}
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
        {isMediumScreen && <NavigationControl showCompass={false} />}

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
