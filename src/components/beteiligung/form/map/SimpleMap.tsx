import { useEffect, useState } from "react"
import Map, { Marker, MarkerDragEvent, NavigationControl, useMap } from "react-map-gl/maplibre"
import {
  LayerType,
  SurveyBackgroundSwitcher,
} from "@/src/components/beteiligung/form/map/BackgroundSwitcher"
import { SurveyMapOutOfViewPanel } from "@/src/components/beteiligung/form/map/MapOutOfViewPanel"
import SurveyPin from "@/src/components/beteiligung/form/map/Pin"
import {
  getSurveyMapStyle,
  installMapGrabIfTest,
  notifyPlaywrightMapLoaded,
} from "@/src/components/beteiligung/form/map/testMode"
import { getInitialViewStateFromGeometryString } from "@/src/components/beteiligung/form/map/utils"
import "maplibre-gl/dist/maplibre-gl.css"
import { useFieldContext } from "@/src/components/beteiligung/shared/hooks/form-context"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { useAllowedSurveySlug } from "@/src/components/beteiligung/shared/utils/useAllowedSurveySlug"

type Props = {
  description?: string
  config: {
    bounds: [number, number, number, number]
  }
}

type LatLng = { lat: number; lng: number }

/**
 * Free pin map (follow-up step after a geometry category was chosen elsewhere).
 *
 * Use case: participant drags a pin to a concrete spot. Field value is `{ lat, lng }`.
 * Camera: already-placed pin → form `geometryCategory` coords (fit bounds) → `config.bounds`.
 *
 * Use after {@link SurveyGeoCategoryMap} (e.g. RSV steckbrief feedback).
 */
export const SurveySimpleMap = ({ config, description }: Props) => {
  const mapBounds: { bounds: [number, number, number, number] } = {
    bounds: config.bounds,
  }
  const surveySlug = useAllowedSurveySlug()
  const { mainMap } = useMap()
  const field = useFieldContext<LatLng>()
  const [markerPosition, setMarkerPosition] = useState<LatLng | undefined>(() => field.state.value)
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
    if (mainMap && markerPosition && mainMap.getBounds().contains(markerPosition)) {
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
    if (markerPosition) {
      mainMap?.easeTo({
        center: [markerPosition.lng, markerPosition.lat],
        duration: 1000,
      })
    }
  }

  const handleMapMove = () => {
    checkPinInView()
  }
  const handleMapZoom = () => {
    checkPinInView()
  }

  // Camera: pin already set → selected geometryCategory → config.bounds.
  const boundsViewState = { ...mapBounds, fitBoundsOptions: { padding: 100 } }
  const pinViewState =
    !field.state.meta.isPristine && field.state.value
      ? { latitude: field.state.value.lat, longitude: field.state.value.lng, zoom: 12 }
      : null
  const geometryCategory = field.form.getFieldValue("geometryCategory")
  const viewFromGeometry =
    typeof geometryCategory === "string"
      ? getInitialViewStateFromGeometryString(geometryCategory)
      : undefined
  const initialViewState = pinViewState ?? viewFromGeometry ?? boundsViewState

  return (
    <>
      <div className="mt-4 h-125" aria-describedby={description ? `${field.name}-hint` : undefined}>
        <Map
          id="mainMap"
          onMove={handleMapMove}
          onZoom={handleMapZoom}
          onLoad={notifyPlaywrightMapLoaded}
          mapStyle={getSurveyMapStyle({ selectedLayer, maptilerUrl })}
          scrollZoom={false}
          initialViewState={initialViewState}
          maxZoom={13}
          minZoom={7}
          cursor="grab"
        >
          <NavigationControl showCompass={false} />
          {markerPosition && (
            <Marker
              longitude={markerPosition.lng}
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
