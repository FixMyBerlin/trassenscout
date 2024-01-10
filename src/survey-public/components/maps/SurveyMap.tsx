import clsx from "clsx"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import React, { useCallback, useContext, useEffect, useState } from "react"
import Map, {
  LngLat,
  LngLatBoundsLike,
  Marker,
  MarkerDragEvent,
  NavigationControl,
  useMap,
} from "react-map-gl/maplibre"
import { LayerType } from "src/core/components/Map/BackgroundSwitcher"
import { SurveyBackgroundSwitcher } from "src/survey-public/components/maps/SurveyBackgroundSwitcher"
import { SurveyMapBanner } from "src/survey-public/components/maps/SurveyMapBanner"
import SurveyPin from "src/survey-public/components/maps/SurveyPin"
import { PinContext } from "src/survey-public/context/contexts"

export type SurveyMapProps = {
  className?: string
  children?: React.ReactNode
  projectMap: {
    maptilerStyleUrl: string
    initialMarker: { lng: number; lat: number }
    config: {
      bounds: LngLatBoundsLike
      pinColor: string
    }
  }
  setIsMapDirty: any
}

export const SurveyMap: React.FC<SurveyMapProps> = ({ projectMap, className, setIsMapDirty }) => {
  const { mainMap } = useMap()
  const [events, logEvents] = useState<Record<string, LngLat>>({})
  const [isPinInView, setIsPinInView] = useState(true)
  const [isMediumScreen, setIsMediumScreen] = useState(false)

  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")

  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }

  const { pinPosition, setPinPosition } = useContext(PinContext)

  const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"

  const vectorStyle = `${projectMap.maptilerStyleUrl}?key=${maptilerApiKey}`
  const satelliteStyle = `${"https://api.maptiler.com/maps/hybrid/style.json"}?key=${maptilerApiKey}`

  if (!pinPosition) setPinPosition(projectMap.initialMarker)

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

  const onMarkerDragStart = useCallback(
    (event: MarkerDragEvent) => {
      setIsMapDirty(true)
      logEvents((_events) => ({ ..._events, onDragStart: event.lngLat }))
    },
    [setIsMapDirty],
  )

  const onMarkerDrag = (event: MarkerDragEvent) => {
    logEvents((_events) => ({ ..._events, onDrag: event.lngLat }))
    setPinPosition({
      lng: event.lngLat.lng,
      lat: event.lngLat.lat,
    })
  }

  const onMarkerDragEnd = useCallback((event: MarkerDragEvent) => {
    logEvents((_events) => ({ ..._events, onDragEnd: event.lngLat }))
  }, [])

  const checkPinInView = () => {
    if (mainMap && pinPosition && mainMap?.getBounds().contains(pinPosition)) {
      setIsPinInView(true)
    } else {
      setIsPinInView(false)
    }
  }

  const easeToPin = () => {
    pinPosition &&
      mainMap?.easeTo({
        center: [pinPosition.lng, pinPosition.lat],
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
    <div className={clsx("h-[500px]", className)}>
      {/* <div className={clsx(className, "h-[500px]")}> */}
      <Map
        id="mainMap"
        initialViewState={{
          bounds: config.bounds,
        }}
        scrollZoom={false}
        onMove={handleMapMove}
        mapStyle={selectedLayer === "vector" ? vectorStyle : satelliteStyle}
        onZoom={handleMapZoom}
        mapLib={maplibregl}
        // @ts-expect-error: See https://github.com/visgl/react-map-gl/issues/2310
        RTLTextPlugin={null}
      >
        {pinPosition && (
          <Marker
            longitude={pinPosition?.lng}
            latitude={pinPosition?.lat}
            anchor="bottom"
            draggable
            onDragStart={onMarkerDragStart}
            onDrag={onMarkerDrag}
            onDragEnd={onMarkerDragEnd}
          >
            <SurveyPin color={config.pinColor} />
          </Marker>
        )}

        {isMediumScreen && <NavigationControl showCompass={false} />}

        <SurveyMapBanner
          className="absolute bottom-12 font-sans"
          action={easeToPin}
          status={isPinInView ? "default" : "pinOutOfView"}
        />
        <SurveyBackgroundSwitcher
          className="absolute left-4 top-4"
          value={selectedLayer}
          onChange={handleLayerSwitch}
        />
      </Map>
    </div>
  )
}
