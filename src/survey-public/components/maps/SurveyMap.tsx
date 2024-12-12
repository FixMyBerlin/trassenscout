import { LayerType } from "@/src/core/components/Map/BackgroundSwitcher"
import { SurveyBackgroundSwitcher } from "@/src/survey-public/components/maps/SurveyBackgroundSwitcher"
import { bbox, center, lineString, multiLineString } from "@turf/turf"
import { clsx } from "clsx"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { useCallback, useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import Map, {
  Layer,
  Marker,
  MarkerDragEvent,
  NavigationControl,
  Source,
  useMap,
} from "react-map-gl/maplibre"
import { getResponseConfigBySurveySlug } from "../../utils/getConfigBySurveySlug"
import { SurveyMapBanner } from "./SurveyMapBanner"
import SurveyPin from "./SurveyPin"

export type SurveyMapProps = {
  className?: string
  children?: React.ReactNode
  projectMap: {
    maptilerUrl: string
    initialMarker: { lng: number; lat: number }
    config: {
      bounds: [number, number, number, number]
    }
  }
  setIsMapDirty: (value: boolean) => void
  pinId: number
  lineGeometryId?: number
}

export const SurveyMap: React.FC<SurveyMapProps> = ({
  projectMap,
  pinId,
  className,
  setIsMapDirty,
  lineGeometryId,
  // todo survey clean up or refactor after survey BB line selection
}) => {
  const { mainMap } = useMap()
  const [events, logEvents] = useState<Record<string, Object>>({})
  const [isPinInView, setIsPinInView] = useState(true)
  const [isMediumScreen, setIsMediumScreen] = useState(false)
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")

  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }
  const { getValues, setValue } = useFormContext()

  const checkLineType = (selectedLine: any): string => {
    if (Array.isArray(selectedLine)) {
      if (Array.isArray(selectedLine[0])) {
        if (Array.isArray(selectedLine[0][0])) {
          return "MultiLineString" // 3D array
        }
        return "LineString" // 2D array
      }
    }
    return "Unknown"
  }

  const getParsedLine = (selectedLine: any) => {
    if (!selectedLine) return null
    const lineType = checkLineType(JSON.parse(selectedLine))

    switch (lineType) {
      case "LineString":
        // @ts-expect-error
        return lineString(JSON.parse(selectedLine))
      case "MultiLineString":
        // @ts-expect-error
        return multiLineString(JSON.parse(selectedLine))
      default:
        return null
    }
  }

  // todo survey clean up or refactor after survey BB line selection
  // take line geometry from form context
  const selectedLine = getValues()[`custom-${lineGeometryId}`] || null
  const parsedSelectedLine = getParsedLine(selectedLine)

  const mapBounds: { bounds: [number, number, number, number] } = {
    // @ts-expect-error
    bounds: parsedSelectedLine ? bbox(parsedSelectedLine) : projectMap.config.bounds,
  }

  // todo survey clean up or refactor after survey BB
  const { evaluationRefs } = getResponseConfigBySurveySlug("radnetz-brandenburg")
  const lineQuestionId = evaluationRefs["line-id"]

  // todo survey clean up or refactor after survey BB  (center of line option)
  // take pinPosition from form context - if it is not defined use center of selected line - if we do not have a selected line use initialMarker fallback from feedback.ts configuration
  const pinPosition =
    getValues()[`map-${pinId}`] ||
    (parsedSelectedLine
      ? {
          lng: center(parsedSelectedLine).geometry.coordinates[0],
          lat: center(parsedSelectedLine).geometry.coordinates[1],
        }
      : projectMap.initialMarker)

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

  const onMarkerDragStart = useCallback(
    (event: MarkerDragEvent) => {
      setIsMapDirty(true)
      logEvents((_events) => ({ ..._events, onDragStart: event.lngLat }))
    },
    [setIsMapDirty],
  )

  const onMarkerDrag = (event: MarkerDragEvent) => {
    logEvents((_events) => ({ ..._events, onDrag: event.lngLat }))
    setValue(
      `map-${pinId}`,
      {
        lng: event.lngLat.lng,
        lat: event.lngLat.lat,
      },
      { shouldValidate: true, shouldDirty: true },
    )
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
        scrollZoom={false}
        initialViewState={{ ...mapBounds, fitBoundsOptions: { padding: 100 } }}
        onMove={handleMapMove}
        mapStyle={selectedLayer === "vector" ? vectorStyle : satelliteStyle}
        onZoom={handleMapZoom}
        mapLib={maplibregl}
        RTLTextPlugin={false}
        maxZoom={13}
        minZoom={7}
        // hash={true}
        cursor="grab"
      >
        {isMediumScreen && <NavigationControl showCompass={false} />}
        <Source
          key="SourceNetzentwurf"
          type="vector"
          minzoom={6}
          maxzoom={10}
          tiles={[
            "https://api.maptiler.com/tiles/650084a4-a206-4873-8873-e3a43171b6ea/{z}/{x}/{y}.pbf?key=ECOoUBmpqklzSCASXxcu",
          ]}
        >
          <Layer
            id="LayerNetzentwurf"
            type="line"
            source-layer="default"
            beforeId="Fühung unklar"
            paint={{
              "line-color": "hsl(30, 100%, 50%)",
              "line-width": ["interpolate", ["linear"], ["zoom"], 0, 1, 8, 1.5, 13.8, 5],
              "line-dasharray": [3, 2],
            }}
          />
          <Layer
            id="LayerSelectedLine"
            type="line"
            source-layer="default"
            layout={{ visibility: selectedLine ? "visible" : "none" }}
            filter={["==", "Verbindung", getValues()[`custom-${lineQuestionId}`] || ""]}
            paint={{
              "line-width": 5,
              "line-color": ["case", ["has", "color"], ["get", "color"], "#994F0B"],
              "line-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 1],
            }}
          />
        </Source>

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
