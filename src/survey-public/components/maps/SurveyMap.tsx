import { lineString } from "@turf/helpers"
import { bbox, center } from "@turf/turf"
import clsx from "clsx"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import React, { useCallback, useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import Map, {
  Layer,
  LngLat,
  Marker,
  MarkerDragEvent,
  NavigationControl,
  Source,
  useMap,
} from "react-map-gl/maplibre"
import { LayerType } from "src/core/components/Map/BackgroundSwitcher"
import { SurveyBackgroundSwitcher } from "src/survey-public/components/maps/SurveyBackgroundSwitcher"
import { SurveyMapBanner } from "src/survey-public/components/maps/SurveyMapBanner"
import SurveyPin from "src/survey-public/components/maps/SurveyPin"
import { getCompletedQuestionIds } from "src/survey-public/utils/getCompletedQuestionIds"

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
  // todo as we use SurveyMap in the external survey response form, questionids and setcompleted... are optional
  // we should seperate these components as the public survey will NOT work without these props
  questionIds?: number[]
  setIsCompleted?: (value: boolean) => void
  // todo survey clean up or refactor after survey BBline selection
  lineGeometryId?: number
}

export const SurveyMap: React.FC<SurveyMapProps> = ({
  projectMap,
  pinId,
  className,
  setIsMapDirty,
  questionIds,
  setIsCompleted,
  lineGeometryId,
  // todo survey clean up or refactor after survey BB line selection
}) => {
  const { mainMap } = useMap()
  const [events, logEvents] = useState<Record<string, LngLat>>({})
  const [isPinInView, setIsPinInView] = useState(true)
  const [isMediumScreen, setIsMediumScreen] = useState(false)
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")

  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }
  const { getValues, setValue } = useFormContext()

  // todo survey clean up or refactor after survey BB line selection
  // take line geometry from form context
  const selectedLine = getValues()[`custom-${lineGeometryId}`] || null
  const mapBounds: { bounds: [number, number, number, number] } = {
    // @ts-expect-error
    bounds: selectedLine
      ? // @ts-expect-error
        bbox(lineString(JSON.parse(selectedLine)))
      : projectMap.config.bounds,
  }

  // todo survey clean up or refactor after survey BB  (center of line option)
  // take pinPosition from form context - if it is not defined use center of selected line - if we do not have a selected line use initialMarker fallback from feedback.ts configuration
  const pinPosition =
    getValues()[`map-${pinId}`] ||
    (selectedLine
      ? {
          // @ts-expect-error
          lng: center(lineString(JSON.parse(selectedLine))).geometry.coordinates[0],
          // @ts-expect-error
          lat: center(lineString(JSON.parse(selectedLine))).geometry.coordinates[1],
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
    setValue(`map-${pinId}`, {
      lng: event.lngLat.lng,
      lat: event.lngLat.lat,
    })
    const values = getValues()
    const completedQuestionIds = getCompletedQuestionIds(values)
    // todo as we use surveymap in the external survey response form , question ids and setcompleted... are optional
    // we should seperate these components as the public survey will NOT work without these props
    // check if all questions from page one have been answered; compare arrays
    questionIds &&
      setIsCompleted &&
      setIsCompleted(questionIds!.every((val) => completedQuestionIds.includes(val)))
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
        mapLib={maplibregl}
        // @ts-expect-error: See https://github.com/visgl/react-map-gl/issues/2310
        RTLTextPlugin={null}
      >
        {/* // todo survey clean up or refactor after survey BB line selection */}
        {selectedLine && (
          <Source
            key={"Netzentwurf"}
            type="geojson"
            // @ts-expect-error
            data={lineString(JSON.parse(selectedLine))}
          >
            <Layer
              id={"SelectedLine"}
              type="line"
              paint={{
                "line-width": 5,
                "line-color": ["case", ["has", "color"], ["get", "color"], "#994F0B"],
                "line-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 1],
              }}
            />
          </Source>
        )}
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
