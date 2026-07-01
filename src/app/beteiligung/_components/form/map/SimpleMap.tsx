"use client"

import {
  LayerType,
  SurveyBackgroundSwitcher,
} from "@/src/app/beteiligung/_components/form/map/BackgroundSwitcher"
import { SurveyMapOutOfViewPanel } from "@/src/app/beteiligung/_components/form/map/MapOutOfViewPanel"
import SurveyPin from "@/src/app/beteiligung/_components/form/map/Pin"
import {
  getSurveyMapStyle,
  installMapGrabIfTest,
  notifyPlaywrightMapLoaded,
} from "@/src/app/beteiligung/_components/form/map/testMode"
import { useFieldContext } from "@/src/app/beteiligung/_shared/hooks/form-context"
import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import "maplibre-gl/dist/maplibre-gl.css"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Map, { Marker, MarkerDragEvent, NavigationControl, useMap } from "react-map-gl/maplibre"

type Props = {
  description?: string
  config: {
    bounds: [number, number, number, number]
  }
}

export const SurveySimpleMap = ({ config, description }: Props) => {
  const mapBounds: { bounds: [number, number, number, number] } = {
    bounds: config.bounds,
  }
  const surveySlug = useParams()?.surveySlug as AllowedSurveySlugs
  const { mainMap } = useMap()
  const field = useFieldContext<object>()
  // tbd - maybe we do not need another internal state here
  const [markerPosition, setMarkerPosition] = useState(field.state.value)
  const [isPinInView, setIsPinInView] = useState(true)
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")

  useEffect(() => {
    if (!mainMap) return
    installMapGrabIfTest(mainMap.getMap(), "mainMap")
  }, [mainMap])

  const { maptilerUrl } = getConfigBySurveySlug(surveySlug, "meta")

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

  return (
    <>
      <div className="mt-4 h-[500px]" aria-describedby={description ? `${field.name}-hint` : undefined}>
        <Map
          id="mainMap"
          onMove={handleMapMove}
          onZoom={handleMapZoom}
          onLoad={notifyPlaywrightMapLoaded}
          mapStyle={getSurveyMapStyle({ selectedLayer, maptilerUrl })}
          scrollZoom={false}
          initialViewState={{ ...mapBounds, fitBoundsOptions: { padding: 100 } }}
          maxZoom={13}
          minZoom={7}
          cursor="grab"
        >
          <NavigationControl showCompass={false} />
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
          <SurveyMapOutOfViewPanel
            action={easeToPin}
            status={isPinInView ? "default" : "pinOutOfView"}
          />
          <SurveyBackgroundSwitcher
            position="top-left"
            value={selectedLayer}
            onChange={handleLayerSwitch}
          />
        </Map>
      </div>
    </>
  )
}
