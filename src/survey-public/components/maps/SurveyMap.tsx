import { MultiLineString } from "@turf/helpers"
import clsx from "clsx"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import React, { useCallback, useContext, useEffect, useState } from "react"
import Map, {
  Layer,
  LngLat,
  LngLatBoundsLike,
  Marker,
  MarkerDragEvent,
  NavigationControl,
  Source,
  useMap,
} from "react-map-gl/maplibre"
import { LayerType } from "src/core/components/Map/BackgroundSwitcher"
import { SurveyMapBanner } from "src/survey-public/components/maps/SurveyMapBanner"
import { SurveyBackgroundSwitcher } from "src/survey-public/components/maps/SurveyBackgroundSwitcher"
import SurveyPin from "src/survey-public/components/maps/SurveyPin"
import { PinContext } from "src/survey-public/components/context/contexts"

export type SurveyMapProps = {
  className?: string
  children?: React.ReactNode
  projectMap: {
    maptilerStyleUrl: string
    projectGeometry: MultiLineString
    layerStyles: Record<string, any>
    initialMarker: { lng: number; lat: number }
    config: {
      bounds: LngLatBoundsLike
      minZoom?: number
      maxZoom?: number
    }
  }
  isMapDirty: any
  setIsMapDirty: any
}

export const SurveyMap: React.FC<SurveyMapProps> = ({
  projectMap,
  className,
  children,
  isMapDirty,
  setIsMapDirty,
}) => {
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
  const satelliteStyle = `${projectMap.maptilerStyleUrl}?key=${maptilerApiKey}`

  if (!pinPosition) setPinPosition(projectMap.initialMarker)

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
    <div className={clsx(className, "h-[500px]")}>
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
            <SurveyPin />
          </Marker>
        )}
        {projectMap.projectGeometry && (
          <Source type="geojson" data={projectMap.projectGeometry}>
            {projectMap.layerStyles &&
              projectMap.layerStyles.map((layer: any) => {
                return <Layer key={layer.id} {...layer} />
              })}
          </Source>
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
