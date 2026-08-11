import { useStore } from "@tanstack/react-form"
import type { Map as MaplibreMap, MapLibreEvent } from "maplibre-gl"
import { useState } from "react"
import Map, {
  MapLayerMouseEvent,
  Marker,
  MarkerDragEvent,
  NavigationControl,
  useMap,
} from "react-map-gl/maplibre"
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
import {
  applySelectedGeometryCategoryFeatureState,
  getInitialViewStateFromGeometryString,
} from "@/src/components/beteiligung/form/map/utils"
import "maplibre-gl/dist/maplibre-gl.css"
import { useFieldContext } from "@/src/components/beteiligung/shared/hooks/form-context"
import type { MapData } from "@/src/components/beteiligung/shared/types"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { useAllowedSurveySlug } from "@/src/components/beteiligung/shared/utils/useAllowedSurveySlug"
import { AllLayers, generateLayers } from "@/src/components/core/components/Map/AllLayers"
import { AllSources } from "@/src/components/core/components/Map/AllSources"
import { usePmtilesProtocol } from "@/src/components/core/components/Map/pmtilesProtocol"

type Props = {
  description?: string
  /** Same survey `mapData` as {@link SurveyGeoCategoryMap}; selected feature is highlighted via feature-state. */
  mapData?: MapData
  config: {
    bounds: [number, number, number, number]
    minZoom: number
    maxZoom: number
  }
}

type LatLng = { lat: number; lng: number }

/**
 * Free pin map (follow-up step after a geometry category was chosen elsewhere).
 *
 * Use case: participant drags or clicks a pin to a concrete spot. Field value is `{ lat, lng }`.
 * Camera: remount on `geometryCategory` change (`key`) → fit selected Strecke / config.bounds.
 * Overlay: optional `mapData` with the previously selected feature highlighted (same as GeoCategoryMap).
 * Pin reset on Strecke change happens in {@link SurveyGeoCategoryMap} (sets `location`).
 *
 * Use after {@link SurveyGeoCategoryMap} (e.g. RSV steckbrief feedback).
 */
export const SurveySimpleMap = ({ config, description, mapData }: Props) => {
  const mapBounds: { bounds: [number, number, number, number] } = {
    bounds: config.bounds,
  }
  const surveySlug = useAllowedSurveySlug()
  const { mainMap } = useMap()
  const field = useFieldContext<LatLng>()
  const geometryCategory = useStore(field.form.store, (state) => state.values.geometryCategory)
  const geometryKey = typeof geometryCategory === "string" ? geometryCategory : ""
  const [dragPosition, setDragPosition] = useState<LatLng | null>(null)
  const [dragGeometryKey, setDragGeometryKey] = useState(geometryKey)
  if (dragGeometryKey !== geometryKey) {
    setDragGeometryKey(geometryKey)
    setDragPosition(null)
  }
  const markerPosition = dragPosition ?? field.state.value
  const [isPinInView, setIsPinInView] = useState(true)
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")

  usePmtilesProtocol()

  const { maptilerUrl } = getConfigBySurveySlug(surveySlug, "meta")

  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }

  const checkPinInView = (map: MaplibreMap) => {
    if (markerPosition && map.getBounds().contains(markerPosition)) {
      setIsPinInView(true)
    } else {
      setIsPinInView(false)
    }
  }

  const placePin = (position: LatLng) => {
    setDragPosition(null)
    field.handleChange(position)
  }

  const onMarkerDrag = (event: MarkerDragEvent) => {
    setDragPosition({ lng: event.lngLat.lng, lat: event.lngLat.lat })
  }
  const onMarkerDragEnd = (event: MarkerDragEvent) => {
    placePin({ lng: event.lngLat.lng, lat: event.lngLat.lat })
  }

  const handleMapClick = (event: MapLayerMouseEvent) => {
    placePin({ lng: event.lngLat.lng, lat: event.lngLat.lat })
  }

  const easeToPin = () => {
    if (markerPosition) {
      mainMap?.easeTo({
        center: [markerPosition.lng, markerPosition.lat],
        duration: 1000,
      })
    }
  }

  const handleMapMove = (event: MapLibreEvent) => {
    checkPinInView(event.target)
  }
  const handleMapZoom = (event: MapLibreEvent) => {
    checkPinInView(event.target)
  }

  // Remount when Strecke changes so initialViewState fits the new geometry (no fitBounds effect).
  const boundsViewState = { ...mapBounds, fitBoundsOptions: { padding: 100 } }
  const viewFromGeometry = geometryKey
    ? getInitialViewStateFromGeometryString(geometryKey)
    : undefined
  const initialViewState = viewFromGeometry ?? boundsViewState

  return (
    <>
      <div className="mt-4 h-125" aria-describedby={description ? `${field.name}-hint` : undefined}>
        <Map
          key={geometryKey || "bounds"}
          id="mainMap"
          onMove={handleMapMove}
          onZoom={handleMapZoom}
          onClick={handleMapClick}
          onLoad={(event) => {
            notifyPlaywrightMapLoaded()
            installMapGrabIfTest(event.target, "mainMap")
          }}
          onIdle={(event) => {
            applySelectedGeometryCategoryFeatureState(
              event.target,
              mapData,
              field.form.getFieldValue,
            )
          }}
          mapStyle={getSurveyMapStyle({ selectedLayer, maptilerUrl })}
          scrollZoom={false}
          initialViewState={initialViewState}
          maxZoom={config.maxZoom}
          minZoom={config.minZoom}
          cursor="crosshair"
        >
          <NavigationControl showCompass={false} />
          {mapData && (
            <>
              <AllSources mapData={mapData} />
              <AllLayers layers={[...generateLayers(mapData)]} />
            </>
          )}
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
