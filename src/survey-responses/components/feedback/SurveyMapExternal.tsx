import { LayerType } from "@/src/core/components/Map/BackgroundSwitcher"
import { SurveyBackgroundSwitcher } from "@/src/survey-public/components/maps/SurveyBackgroundSwitcher"
import { SurveyMapBanner } from "@/src/survey-public/components/maps/SurveyMapBanner"
import SurveyPin from "@/src/survey-public/components/maps/SurveyPin"
import { clsx } from "clsx"
import "maplibre-gl/dist/maplibre-gl.css"
import { useCallback, useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import Map, { Marker, MarkerDragEvent, NavigationControl, useMap } from "react-map-gl/maplibre"

type Props = {
  className?: string
  children?: React.ReactNode
  projectMap: {
    maptilerUrl: string
    initialMarker: { lng: number; lat: number }
    config: {
      bounds: [number, number, number, number]
    }
  }
  pinId: number
  // todo as we use SurveyMap in the external survey response form, questionids and setcompleted... are optional
  // we should seperate these components as the public survey will NOT work without these props
  // UPDATE: this component is only used in the internal survey response form for "externe Beiträge"
  // the reason for the separation was that we changed the way of including the "netzentwurf" layer in the BB survey last minute
  // still we have to clean up and rework this component and all survey map components
}

export const SurveyMapExternal = ({
  projectMap,
  pinId,
  className,
  // todo survey clean up or refactor after survey BB line selection
}: Props) => {
  const { mainMap } = useMap()
  const [events, logEvents] = useState<Record<string, Object>>({})
  const [isPinInView, setIsPinInView] = useState(true)
  const [isMediumScreen, setIsMediumScreen] = useState(false)
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")

  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }
  const { getValues, setValue } = useFormContext()

  const mapBounds: { bounds: [number, number, number, number] } = {
    bounds: projectMap.config.bounds,
  }

  // take pinPosition from form context - if it is not defined use center of selected line - if we do not have a selected line use initialMarker fallback from feedback.ts configuration
  const pinPosition = getValues()[`map-${pinId}`] || projectMap.initialMarker

  const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"
  const vectorStyle = `${projectMap.maptilerUrl}?key=${maptilerApiKey}`
  const satelliteStyle = `${"https://api.maptiler.com/maps/hybrid/style.json"}?key=${maptilerApiKey}`

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

  const onMarkerDrag = (event: MarkerDragEvent) => {
    logEvents((_events) => ({ ..._events, onDrag: event.lngLat }))
    setValue(`map-${pinId}`, {
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

  return (
    <div className={clsx("h-[500px]", className)}>
      <Map
        id="mainMap"
        initialViewState={{ ...mapBounds, fitBoundsOptions: { padding: 100 } }}
        scrollZoom={false}
        onMove={handleMapMove}
        mapStyle={selectedLayer === "vector" ? vectorStyle : satelliteStyle}
        onZoom={handleMapZoom}
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
        {isMediumScreen && <NavigationControl showCompass={false} />}
        <SurveyMapBanner
          className="absolute bottom-12"
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
