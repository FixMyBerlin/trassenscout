"use client"

import {
  LayerType,
  SurveyBackgroundSwitcher,
} from "@/src/app/beteiligung-neu/_components/form/map/BackgroundSwitcher"
import { SurveyMapBanner } from "@/src/app/beteiligung-neu/_components/form/map/MapBanner"
import SurveyPin from "@/src/app/beteiligung-neu/_components/form/map/Pin"
import { useFieldContext } from "@/src/app/beteiligung-neu/_shared/hooks/form-context"
import { isDev } from "@/src/core/utils"
import { installMapGrab } from "@mapgrab/map-interface"
import { clsx } from "clsx"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { useState } from "react"
import Map, {
  Marker,
  MarkerDragEvent,
  NavigationControl,
  Source,
  useMap,
} from "react-map-gl/maplibre"

type Props = {
  maptilerUrl: string
  config: {
    bounds: [number, number, number, number]
  }
  // field: ReturnType<typeof useFieldContext>
}

export const SurveySimpleMap = ({ maptilerUrl, config }: Props) => {
  const mapBounds: { bounds: [number, number, number, number] } = {
    bounds: config.bounds,
  }

  const { mainMap } = useMap()
  const field = useFieldContext<object>()
  // tbd - maybe we do not need another internal state here
  const [markerPosition, setMarkerPosition] = useState(field.state.value)
  const [isPinInView, setIsPinInView] = useState(true)
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")

  const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"
  const vectorStyle = `${maptilerUrl}?key=${maptilerApiKey}`
  const satelliteStyle = `${"https://api.maptiler.com/maps/hybrid/style.json"}?key=${maptilerApiKey}`

  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }

  const checkPinInView = () => {
    console.log({ markerPosition, mainMap })
    // @ts-expect-error todo
    if (mainMap && markerPosition && mainMap?.getBounds().contains(markerPosition)) {
      setIsPinInView(true)
    } else {
      setIsPinInView(false)
    }
  }

  const onMarkerDrag = (event: MarkerDragEvent) => {
    const newPosition = { lng: event.lngLat.lng, lat: event.lngLat.lat }
    setMarkerPosition(newPosition)
  }
  const onMarkerDragEnd = (event: MarkerDragEvent) => {
    const newPosition = { lng: event.lngLat.lng, lat: event.lngLat.lat }
    if (newPosition) field.handleChange(newPosition)
  }

  const easeToPin = () => {
    markerPosition &&
      mainMap?.easeTo({
        // @ts-expect-error todo
        center: [markerPosition.lng, markerPosition.lat],
        duration: 1000,
      })
  }

  const handleMapMove = () => {
    checkPinInView()
  }
  const handleMapZoom = () => {
    checkPinInView()
  }

  // atm we install it in dev mode only
  // todo have something like RUN_ONLY_IN_TEST_ENV to make it run in tests only
  if (isDev) {
    if (mainMap) {
      console.log("install map grab")
      installMapGrab(mainMap.getMap(), "mainMap")
    }
  }

  return (
    <>
      <div className={clsx("h-[500px]")} aria-describedby={`${field.name}Hint`}>
        <Map
          id="mainMap"
          onMove={handleMapMove}
          onZoom={handleMapZoom}
          mapStyle={selectedLayer === "vector" ? vectorStyle : satelliteStyle}
          scrollZoom={false}
          initialViewState={{ ...mapBounds, fitBoundsOptions: { padding: 100 } }}
          mapLib={maplibregl}
          maxZoom={13}
          minZoom={7}
          cursor="grab"
        >
          <NavigationControl showCompass={false} />
          <Source
            key="SourceNetzentwurf"
            type="vector"
            minzoom={6}
            maxzoom={10}
            tiles={[
              "https://api.maptiler.com/tiles/650084a4-a206-4873-8873-e3a43171b6ea/{z}/{x}/{y}.pbf?key=ECOoUBmpqklzSCASXxcu",
            ]}
          ></Source>

          {markerPosition && (
            <Marker
              // @ts-expect-error todo
              longitude={markerPosition.lng}
              // @ts-expect-error todo
              latitude={markerPosition.lat}
              anchor="bottom"
              draggable
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
    </>
  )
}
