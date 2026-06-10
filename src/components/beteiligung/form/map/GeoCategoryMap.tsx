import { useSearch } from "@tanstack/react-router"
import maplibregl from "maplibre-gl"
import * as pmtiles from "pmtiles"
import { useEffect, useState } from "react"
import Map, {
  MapGeoJSONFeature,
  MapLayerMouseEvent,
  NavigationControl,
  useMap,
} from "react-map-gl/maplibre"
import {
  LayerType,
  SurveyBackgroundSwitcher,
} from "@/src/components/beteiligung/form/map/BackgroundSwitcher"
import { SurveyMapGeoCategoryInfoPanel } from "@/src/components/beteiligung/form/map/MapGeoCategoryInfoPanel"
import {
  getSurveyMapStyle,
  installMapGrabIfTest,
  notifyPlaywrightMapLoaded,
} from "@/src/components/beteiligung/form/map/testMode"
import {
  featureStateTargetForMapSource,
  getInitialViewStateFromGeometryString,
} from "@/src/components/beteiligung/form/map/utils"
import { useFieldContext } from "@/src/components/beteiligung/shared/hooks/form-context"
import { MapData } from "@/src/components/beteiligung/shared/types"
import "maplibre-gl/dist/maplibre-gl.css"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { useAllowedSurveySlug } from "@/src/components/beteiligung/shared/utils/useAllowedSurveySlug"
import { AllLayers, generateLayers } from "@/src/components/core/components/Map/AllLayers"
import { AllSources } from "@/src/components/core/components/Map/AllSources"

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

export const SurveyGeoCategoryMap = ({
  config,
  additionalData,
  geoCategoryIdDefinition,
  setInitialBounds,
  description,
  mapData,
  infoPanelText,
}: GeoCategoryMapProps) => {
  const { mainMap } = useMap()
  const field = useFieldContext<string>()
  const search = useSearch({ from: "/beteiligung/$surveySlug/" })
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
    geoCategoryIdDefinition.dataKey,
    geoCategoryIdDefinition.propertyName,
    field.form,
  ])

  useEffect(() => {
    if (!mainMap) return
    installMapGrabIfTest(mainMap.getMap(), "mainMap")
  }, [mainMap])

  const initialViewState =
    // if we have a selected geometry category already, use its bbox
    getInitialViewStateFromGeometryString(field.state.value) || {
      bounds:
        setInitialBounds &&
        setInitialBounds.initialBoundsDefinition.find(
          (d) => d[setInitialBounds.queryParameter] === search[setInitialBounds.queryParameter],
        )
          ? setInitialBounds.initialBoundsDefinition.find(
              (d) => d[setInitialBounds.queryParameter] === search[setInitialBounds.queryParameter],
            )?.bbox
          : // generally use the normal config bounds
            config.bounds,
      fitBoundsOptions: { padding: 70 },
    }
  // if we have a setInitialBounds config, set the bbox depending on the search params
  // this allows us to set the initial bounds based on a query parameter (e.g. set in a read only field)

  const { maptilerUrl } = getConfigBySurveySlug(surveySlug, "meta")

  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }

  const handleMapClick = (event: MapLayerMouseEvent) => {
    const feature = event.features?.[0]
    if (!feature) return

    console.log("handleMapClick", feature)
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
    // @ts-expect-error
    field.handleChange(JSON.stringify(geometry.coordinates))
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

  return (
    <div className="relative mt-4 h-[500px]" aria-describedby={field.name + " Hint"}>
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
        interactiveLayerIds={allInteractiveLayerIds}
        onIdle={() => setMapLoading(false)}
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
