import { useSearch } from "@tanstack/react-router"
import { useRef, useState } from "react"
import Map, {
  MapGeoJSONFeature,
  MapLayerMouseEvent,
  NavigationControl,
} from "react-map-gl/maplibre"
import {
  LayerType,
  SurveyBackgroundSwitcher,
} from "@/src/components/beteiligung/form/map/BackgroundSwitcher"
import { SurveyMapGeoCategoryInfoPanel } from "@/src/components/beteiligung/form/map/MapGeoCategoryInfoPanel"
import { initialViewStateFromMapStartParam } from "@/src/components/beteiligung/form/map/mapStartParam"
import {
  getSurveyMapStyle,
  installMapGrabIfTest,
  notifyPlaywrightMapLoaded,
} from "@/src/components/beteiligung/form/map/testMode"
import {
  applySelectedGeometryCategoryFeatureState,
  featureStateTargetForMapSource,
  getInitialViewStateFromGeometryString,
  latLngOnGeometryCategory,
} from "@/src/components/beteiligung/form/map/utils"
import { useFieldContext } from "@/src/components/beteiligung/shared/hooks/form-context"
import "maplibre-gl/dist/maplibre-gl.css"
import { MapData } from "@/src/components/beteiligung/shared/types"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { useAllowedSurveySlug } from "@/src/components/beteiligung/shared/utils/useAllowedSurveySlug"
import { AllLayers, generateLayers } from "@/src/components/core/components/Map/AllLayers"
import { AllSources } from "@/src/components/core/components/Map/AllSources"
import { usePmtilesProtocol } from "@/src/components/core/components/Map/pmtilesProtocol"

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
    minZoom: number
    maxZoom: number
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

/**
 * Geometry-category picker map (first step when the survey splits location into two maps).
 *
 * Use case: participant clicks an existing feature (Strecke / PA / stop) on configured layers.
 * Stores the feature’s coordinates plus id/label fields from `geoCategoryIdDefinition` /
 * `additionalData`.
 *
 * Camera: restored selection → `?mapStart=zoom/lat/lng` → optional `setInitialBounds` query lookup → `config.bounds`.
 *
 * Pair with {@link SurveySimpleMap} when a free pin is a separate follow-up step.
 */
export const SurveyGeoCategoryMap = ({
  config,
  additionalData,
  geoCategoryIdDefinition,
  setInitialBounds,
  description,
  mapData,
  infoPanelText,
}: GeoCategoryMapProps) => {
  const field = useFieldContext<string>()
  const search = useSearch({ from: "/beteiligung/$surveySlug/" })
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")
  const [cursorStyle, setCursorStyle] = useState("grab")
  const hoveredFeatureRef = useRef<{ source: string; id: string | number } | null>(null)
  const surveySlug = useAllowedSurveySlug()

  usePmtilesProtocol()

  const initialBoundsMatch = setInitialBounds?.initialBoundsDefinition.find(
    (d) => d[setInitialBounds.queryParameter] === search[setInitialBounds.queryParameter],
  )
  // Camera: restored selection → ?mapStart= → setInitialBounds / config.bounds
  const boundsViewState = {
    bounds: initialBoundsMatch?.bbox ?? config.bounds,
    fitBoundsOptions: { padding: 70 },
  }
  const viewFromMapStart = initialViewStateFromMapStartParam(search.mapStart)
  const viewFromGeometry = getInitialViewStateFromGeometryString(field.state.value)
  const initialViewState = viewFromGeometry ?? viewFromMapStart ?? boundsViewState

  const { maptilerUrl } = getConfigBySurveySlug(surveySlug, "meta")

  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }

  const handleMapClick = (event: MapLayerMouseEvent) => {
    const feature = event.features?.[0]
    if (!feature) return
    const map = event.target

    const previouslySelectedFeatureId = field.form.getFieldValue("geometryCategoryFeatureId")
    const previouslySelectedSourceId = field.form.getFieldValue("geometryCategorySourceId")

    const geoCategoryId = feature.properties[geoCategoryIdDefinition.propertyName]
    const geometry = feature.geometry
    // tbd do we want to internally use the feature id as an identifier?
    const featureId = feature.id
    const sourceId = feature.source

    // Clear previous selection state if exists
    if (previouslySelectedFeatureId && previouslySelectedSourceId) {
      map.setFeatureState(
        featureStateTargetForMapSource(
          mapData,
          previouslySelectedSourceId,
          previouslySelectedFeatureId,
        ),
        { selected: false },
      )
    }

    // Set new selection state
    if (geoCategoryId !== undefined && featureId !== undefined) {
      map.setFeatureState(featureStateTargetForMapSource(mapData, sourceId, featureId), {
        selected: true,
      })
    }

    // we (temporarily) store the source and feature id as well, so we can keep teh state of the selected feature
    field.form.setFieldValue("geometryCategorySourceId", sourceId)
    field.form.setFieldValue("geometryCategoryFeatureId", featureId)
    // geometry and id are always set here
    // tbd we always want to stroe and id and a geometry maybe it makes more sense to store it as an object {id: string, geometry: string}
    field.form.setFieldValue(geoCategoryIdDefinition.dataKey, geoCategoryId)
    // @ts-expect-error GeoJSON coordinates → survey stores bare coordinate JSON
    const geometryString = JSON.stringify(geometry.coordinates)
    field.handleChange(geometryString)
    // Reset follow-up pin onto the new Strecke (SimpleMap reads `location`).
    const pinOnGeometry = latLngOnGeometryCategory(geometryString)
    if (pinOnGeometry) {
      field.form.setFieldValue("location", pinOnGeometry)
    }
    // read additional properties and set values in from context
    {
      additionalData.map((data) => {
        const { dataKey, propertyName } = data
        field.form.setFieldValue(dataKey, feature.properties[propertyName])
      })
    }
  }

  const setHover = (
    map: MapLayerMouseEvent["target"],
    feature: { source: string; id: string | number } | null,
    hover: boolean,
  ) => {
    if (!feature) return
    map.setFeatureState(featureStateTargetForMapSource(mapData, feature.source, feature.id), {
      hover,
    })
  }

  const handleMouseMove = ({ features, target: map }: MapLayerMouseEvent) => {
    updateCursor(features)

    const feature = features?.[0]
    const next =
      feature?.id != null && feature.source ? { source: feature.source, id: feature.id } : null
    const prev = hoveredFeatureRef.current
    if (prev?.id === next?.id && prev?.source === next?.source) return

    setHover(map, prev, false)
    setHover(map, next, true)
    hoveredFeatureRef.current = next
  }

  const handleMouseLeave = ({ target: map }: MapLayerMouseEvent) => {
    updateCursor([])
    setHover(map, hoveredFeatureRef.current, false)
    hoveredFeatureRef.current = null
  }

  const updateCursor = (features: MapGeoJSONFeature[] | undefined) => {
    setCursorStyle(features?.length ? "pointer" : "grab")
  }

  const allInteractiveLayerIds = Object.entries(mapData.sources).flatMap(([sourceId, source]) => {
    return source.interactiveLayerIds?.map((l) => `${sourceId}-${l}`) || []
  })

  return (
    <div
      className="relative mt-4 h-125"
      aria-describedby={description ? `${field.name}-hint` : undefined}
    >
      <Map
        id="mainMap"
        scrollZoom={false}
        initialViewState={initialViewState}
        mapStyle={getSurveyMapStyle({ selectedLayer, maptilerUrl })}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onLoad={(event) => {
          notifyPlaywrightMapLoaded()
          installMapGrabIfTest(event.target, "mainMap")
        }}
        maxZoom={config.maxZoom}
        minZoom={config.minZoom}
        cursor={cursorStyle}
        interactiveLayerIds={allInteractiveLayerIds}
        onIdle={(event) => {
          applySelectedGeometryCategoryFeatureState(event.target, mapData, field.form.getFieldValue)
        }}
      >
        <NavigationControl showCompass={false} />
        <AllSources mapData={mapData} />
        <AllLayers layers={[...generateLayers(mapData)]} />
        <SurveyMapGeoCategoryInfoPanel
          description={description}
          infoPanelText={infoPanelText}
          additionalData={additionalData}
          geoCategoryIdDefinition={geoCategoryIdDefinition}
        />
        <SurveyBackgroundSwitcher
          position="top-left"
          value={selectedLayer}
          onChange={handleLayerSwitch}
        />
      </Map>
    </div>
  )
}
