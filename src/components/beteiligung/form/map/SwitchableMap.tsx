import { Radio, RadioGroup } from "@headlessui/react"
import { useSearch } from "@tanstack/react-router"
import clsx from "clsx"
import type { Point } from "geojson"
import maplibregl from "maplibre-gl"
import * as pmtiles from "pmtiles"
import { useEffect, useState } from "react"
import Map, {
  MapGeoJSONFeature,
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
import { SurveyMapGeoCategoryInfoPanel } from "@/src/components/beteiligung/form/map/MapGeoCategoryInfoPanel"
import SurveyPin from "@/src/components/beteiligung/form/map/Pin"
import {
  getSurveyMapStyle,
  installMapGrabIfTest,
  notifyPlaywrightMapLoaded,
} from "@/src/components/beteiligung/form/map/testMode"
import {
  featureStateTargetForMapSource,
  getInitialViewStateFromGeometryString,
  parseSwitchableMapLocationFieldValue,
  type SwitchableMapLocationPoint,
} from "@/src/components/beteiligung/form/map/utils"
import { formClasses } from "@/src/components/beteiligung/form/styles"
import { useFieldContext } from "@/src/components/beteiligung/shared/hooks/form-context"
import { MapData } from "@/src/components/beteiligung/shared/types"
import "maplibre-gl/dist/maplibre-gl.css"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { useAllowedSurveySlug } from "@/src/components/beteiligung/shared/utils/useAllowedSurveySlug"
import { AllLayers, generateLayers } from "@/src/components/core/components/Map/AllLayers"
import { AllSources } from "@/src/components/core/components/Map/AllSources"

export type { SwitchableMapLocationPoint }

function fieldValueToGeometryString(value: unknown) {
  if (value == null || value === "") return ""
  return typeof value === "string" ? value : JSON.stringify(value)
}

function pointFromPointGeometry(geometry: Point) {
  const [lng = 0, lat = 0] = geometry.coordinates
  return { lng, lat }
}

export type GeoCategoryMapProps = {
  description?: string
  mapData: MapData
  // defines the additional data that we want to read from the geometries
  // datakey: the key for the survey response data object
  // propertyName: the name of the property in the geojson that we want to read
  additionalData: { dataKey: string; propertyName: string; label: string }[]
  // the property name in the geojson that we strore as the id for the geometry category
  geoCategoryIdDefinition: { dataKey: string; propertyName: string }
  infoPanelText?: string
  config: {
    bounds: [number, number, number, number]
  }
  setInitialBounds?: {
    initialBoundsDefinition: ({
      id: string
      name: string
      bbox: [number, number, number, number]
    } & Record<string, any>)[]
    // the query parameter that we use to set the initial bounds
    // e.g. "id" or "institution"
    queryParameter: string
  }
}

export const SwitchableMap = ({
  config,
  additionalData,
  geoCategoryIdDefinition,
  setInitialBounds,
  description,
  mapData,
  infoPanelText,
}: GeoCategoryMapProps) => {
  const { mainMap } = useMap()
  const field = useFieldContext<SwitchableMapLocationPoint | null>()
  const search = useSearch({ from: "/beteiligung/$surveySlug/" })
  /** Only used when `isPin` is true; no default — pin mode places the marker. */
  const [markerPosition, setMarkerPosition] = useState<SwitchableMapLocationPoint | undefined>(
    undefined,
  )
  const [isPin, setIsPin] = useState(false)
  const [mapLoading, setMapLoading] = useState(true)
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")
  const [cursorStyle, setCursorStyle] = useState("grab")
  const surveySlug = useAllowedSurveySlug()

  // Setup pmtiles
  useEffect(() => {
    const protocol = new pmtiles.Protocol()
    maplibregl.addProtocol("pmtiles", protocol.tile)
    return () => {
      maplibregl.removeProtocol("pmtiles")
    }
  }, [])

  // oxlint-disable-next-line react-hooks/exhaustive-deps -- Sync map highlight once on load; field.form deps would re-run on every keystroke.
  useEffect(() => {
    // if we have a selected feature (in the form context), we want to set the feature state for the selected geometry
    // this allows us to highlight the selected geometry on the map - even if we reload the map (e.g. go back and forth in the survey)
    // pin mode: no map feature selection / highlight
    if (isPin) return
    const geometryCategorySourceId = field.form.getFieldValue("geometryCategorySourceId")
    const geometryCategoryFeatureId = field.form.getFieldValue("geometryCategoryFeatureId")
    const geoCategoryId = field.form.getFieldValue(geoCategoryIdDefinition.dataKey)
    if (
      mainMap &&
      !mapLoading &&
      geoCategoryId &&
      geometryCategorySourceId &&
      geometryCategoryFeatureId
    ) {
      mainMap.getMap().setFeatureState(
        featureStateTargetForMapSource(mapData, geometryCategorySourceId, {
          id: geometryCategoryFeatureId,
          [geoCategoryIdDefinition.propertyName]: geoCategoryId,
        }),
        { selected: true },
      )
    }
  }, [
    mainMap,
    mapLoading,
    mapData,
    isPin,
    geoCategoryIdDefinition.dataKey,
    geoCategoryIdDefinition.propertyName,
    field.form,
  ])

  useEffect(() => {
    if (!mainMap) return
    installMapGrabIfTest(mainMap.getMap(), "mainMap")
  }, [mainMap])

  const initialLocationPoint = (() => {
    try {
      return parseSwitchableMapLocationFieldValue(field.state.value)
    } catch {
      return null
    }
  })()

  const boundsFromConfig =
    setInitialBounds &&
    setInitialBounds.initialBoundsDefinition.find(
      (d) => d[setInitialBounds.queryParameter] === search[setInitialBounds.queryParameter],
    )
      ? setInitialBounds.initialBoundsDefinition.find(
          (d) => d[setInitialBounds.queryParameter] === search[setInitialBounds.queryParameter],
        )?.bbox
      : config.bounds

  const initialViewState =
    initialLocationPoint != null
      ? {
          latitude: initialLocationPoint.lat,
          longitude: initialLocationPoint.lng,
          zoom: 12,
        }
      : (getInitialViewStateFromGeometryString(fieldValueToGeometryString(field.state.value)) ?? {
          bounds: boundsFromConfig,
          fitBoundsOptions: { padding: 70 },
        })
  // if we have a setInitialBounds config, set the bbox depending on the search params
  // this allows us to set the initial bounds based on a query parameter (e.g. set in a read only field)

  const { maptilerUrl } = getConfigBySurveySlug(surveySlug, "meta")

  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }

  const handleMapClick = (event: MapLayerMouseEvent) => {
    const feature = event.features?.[0]
    if (!feature) return
    const previouslySelectedFeatureId = field.form.getFieldValue("geometryCategoryFeatureId")
    const previouslySelectedSourceId = field.form.getFieldValue("geometryCategorySourceId")

    const geoCategoryId = feature.properties[geoCategoryIdDefinition.propertyName]
    const geometry = feature.geometry
    // tbd do we want to internally use the feature id as an identifier?
    const featureId = feature.id
    const sourceId = feature.source

    // Clear previous selection state if exists
    if (previouslySelectedFeatureId && previouslySelectedSourceId && mainMap) {
      mainMap.getMap().setFeatureState(
        featureStateTargetForMapSource(mapData, previouslySelectedSourceId, {
          id: previouslySelectedFeatureId,
        }),
        { selected: false },
      )
    }

    // Set new selection state
    if (geoCategoryId !== undefined && mainMap && featureId !== undefined) {
      mainMap.getMap().setFeatureState(
        featureStateTargetForMapSource(mapData, sourceId, {
          id: featureId,
          [geoCategoryIdDefinition.propertyName]: geoCategoryId,
        }),
        { selected: true },
      )
    }

    // we (temporarily) store the source and feature id as well, so we can keep teh state of the selected feature
    field.form.setFieldValue("geometryCategorySourceId", sourceId)
    field.form.setFieldValue("geometryCategoryFeatureId", featureId)
    // geometry and id are always set here
    // tbd we always want to stroe and id and a geometry maybe it makes more sense to store it as an object {id: string, geometry: string}
    field.form.setFieldValue(geoCategoryIdDefinition.dataKey, geoCategoryId)
    if (geometry.type !== "Point") {
      throw new Error(`SwitchableMap only supports Point geometries; got ${geometry.type}`)
    }
    field.handleChange(pointFromPointGeometry(geometry))
    // read additional properties and set values in from context
    {
      additionalData.map((data) => {
        const { dataKey, propertyName } = data
        field.form.setFieldValue(dataKey, feature.properties[propertyName])
      })
    }
  }

  const handleMouseMove = ({ features }: MapLayerMouseEvent) => {
    updateCursor(features)
  }

  const handleMouseLeave = () => {
    updateCursor([])
  }

  const updateCursor = (features: MapGeoJSONFeature[] | undefined) => {
    setCursorStyle(features?.length ? "pointer" : "grab")
  }

  const handleMapLoad = (_: maplibregl.MapLibreEvent) => {
    notifyPlaywrightMapLoaded()
    setMapLoading(true)
  }

  const allInteractiveLayerIds = Object.entries(mapData.sources).flatMap(([sourceId, source]) => {
    return source.interactiveLayerIds?.map((l) => `${sourceId}-${l}`) || []
  })

  const clearGeoCategorySelectionAndHighlight = () => {
    const geometryCategoryFeatureId = field.form.getFieldValue("geometryCategoryFeatureId")
    const geometryCategorySourceId = field.form.getFieldValue("geometryCategorySourceId")
    if (mainMap && geometryCategoryFeatureId != null && geometryCategorySourceId != null) {
      mainMap.getMap().setFeatureState(
        featureStateTargetForMapSource(mapData, geometryCategorySourceId, {
          id: geometryCategoryFeatureId,
        }),
        { selected: false },
      )
    }
    field.form.setFieldValue("geometryCategorySourceId", undefined)
    field.form.setFieldValue("geometryCategoryFeatureId", undefined)
    field.form.setFieldValue(geoCategoryIdDefinition.dataKey, undefined)
    for (const { dataKey } of additionalData) {
      field.form.setFieldValue(dataKey, undefined)
    }
  }

  const placePinAtMapCenter = () => {
    const map = mainMap?.getMap()
    if (!map) return false
    const c = map.getCenter()
    const point: SwitchableMapLocationPoint = { lng: c.lng, lat: c.lat }
    setMarkerPosition(point)
    field.handleChange(point)
    return true
  }

  const handlePinModeChange = (next: boolean) => {
    setIsPin(next)
    field.handleChange(null)
    if (!next) return
    clearGeoCategorySelectionAndHighlight()
    if (placePinAtMapCenter()) return
    queueMicrotask(() => {
      if (placePinAtMapCenter()) return
      requestAnimationFrame(() => placePinAtMapCenter())
    })
  }

  const radioButtonDescription =
    "Wenn sich ihre Anmeldung nicht auf eine Haltestelle im Bestand bezieht, können Sie einen individuellenPin setzen."

  const options = [
    { key: false, label: "Ja" },
    { key: true, label: "Nein, ich möchte einen Pin setzen" },
  ]

  const onMarkerDrag = (event: MarkerDragEvent) => {
    const newPosition = { lng: event.lngLat.lng, lat: event.lngLat.lat }
    setMarkerPosition(newPosition)
  }
  const onMarkerDragEnd = (event: MarkerDragEvent) => {
    const { lng, lat } = event.lngLat
    field.handleChange({ lng, lat })
  }

  return (
    <div className="relative mt-4 h-[500px]" aria-describedby={field.name + " Hint"}>
      <p className={formClasses.fieldLabel}>
        Bezieht sich Ihre Anmeldung auf eine Haltestelle im Bestand?
      </p>
      {radioButtonDescription && (
        <p className={formClasses.fieldDescription}>{radioButtonDescription}</p>
      )}
      <RadioGroup
        value={isPin}
        onChange={handlePinModeChange}
        aria-label="Bezieht sich Ihre Anmeldung auf eine Haltestelle im Bestand?"
      >
        {options.map((option) => (
          <Radio
            key={String(option.key)}
            value={option.key}
            className="group flex w-full items-start hover:cursor-pointer"
          >
            <div className="flex h-full min-h-10 items-center">
              <div
                className={clsx(
                  "relative size-4 cursor-pointer rounded-full border border-gray-300 transition-colors group-hover:border-gray-400 focus:ring-0",
                )}
              />
              <span className="absolute m-[2px] size-3 size-4 rounded-full border-4 border-(--survey-primary-color) opacity-0 transition group-data-checked:opacity-100" />
            </div>
            {/* we do not use the simple pattern from the headless UI demos as we want the whole item to be clickable incl. label etc; we use p instead of Label from headless UI as Label breaks the hover for some reason */}{" "}
            <div className={formClasses.labelItemWrapper}>
              <p className={clsx(formClasses.fieldItemLabel)}>{option.label}</p>
            </div>
          </Radio>
        ))}
      </RadioGroup>
      <Map
        id="mainMap"
        scrollZoom={false}
        initialViewState={initialViewState}
        mapStyle={getSurveyMapStyle({ selectedLayer, maptilerUrl })}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        // Set map state for <MapData>:
        onLoad={(event) => handleMapLoad(event)}
        // todo make configurable
        maxZoom={16}
        minZoom={7}
        cursor={cursorStyle}
        interactiveLayerIds={!isPin ? allInteractiveLayerIds : []}
        onIdle={() => setMapLoading(false)}
      >
        <NavigationControl showCompass={false} />
        <AllSources mapData={mapData} />
        <AllLayers layers={[...generateLayers(mapData)]} />
        {!isPin && (
          <SurveyMapGeoCategoryInfoPanel
            description={description}
            infoPanelText={infoPanelText}
            additionalData={additionalData}
            geoCategoryIdDefinition={geoCategoryIdDefinition}
          />
        )}
        <SurveyBackgroundSwitcher
          position="top-left"
          value={selectedLayer}
          onChange={handleLayerSwitch}
        />
        {markerPosition && isPin && (
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
      </Map>
    </div>
  )
}
