import { AllLayers, generateLayers } from "@/src/app/beteiligung/_components/form/map/AllLayers"
import { AllSources } from "@/src/app/beteiligung/_components/form/map/AllSources"
import {
  LayerType,
  SurveyBackgroundSwitcher,
} from "@/src/app/beteiligung/_components/form/map/BackgroundSwitcher"
import { installMapGrabIfTest } from "@/src/app/beteiligung/_components/form/map/installMapGrab"
import { getInitialBoundsFromGeometry } from "@/src/app/beteiligung/_components/form/map/utils"

import { useFieldContext } from "@/src/app/beteiligung/_shared/hooks/form-context"
import { MapData } from "@/src/app/beteiligung/_shared/types"
import { isProduction } from "@/src/core/utils"
import { playwrightSendMapLoadedEvent } from "@/tests/_utils/customMapLoadedEvent"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { useSearchParams } from "next/navigation"
import * as pmtiles from "pmtiles"
import { useEffect, useState } from "react"
import Map, {
  MapGeoJSONFeature,
  MapLayerMouseEvent,
  NavigationControl,
  useMap,
} from "react-map-gl/maplibre"

type Props = {
  description?: string
  mapData: MapData
  maptilerUrl: string
  // defines the additional data that we want to read from the geometries
  // datakey: the key for the survey response data object
  // propertyName: the name of the property in the geojson that we want to read
  additionalData: { dataKey: string; propertyName: string; label: string }[]
  // the property name in the geojson that we strore as the id for the geometry category
  geoCategoryIdDefinition: { dataKey: string; propertyName: string }
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
  maptilerUrl,
  config,
  additionalData,
  geoCategoryIdDefinition,
  setInitialBounds,
  description,
  mapData,
}: Props) => {
  const { mainMap } = useMap()
  const field = useFieldContext<object>()
  const searchParams = useSearchParams()
  const [mapLoading, setMapLoading] = useState(true)
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")
  const [cursorStyle, setCursorStyle] = useState("grab")

  // Setup pmtiles
  useEffect(() => {
    const protocol = new pmtiles.Protocol()
    maplibregl.addProtocol("pmtiles", protocol.tile)
    return () => {
      maplibregl.removeProtocol("pmtiles")
    }
  }, [])

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
        {
          source: geometryCategorySourceId,
          id: geometryCategoryFeatureId,
          [geoCategoryIdDefinition.propertyName]: geoCategoryId,
          sourceLayer: "default",
        },
        { selected: true },
      )
    }
  }, [mainMap, mapLoading])

  if (mainMap) installMapGrabIfTest(mainMap.getMap(), "mainMap")

  const initialBounds: [number, number, number, number] | undefined =
    // if we have a selected geometry category already, use its bbox
    getInitialBoundsFromGeometry(field.state.value) ||
    // if we have a setInitialBounds config, set the bbox depending on the search params
    // this allows us to set the initial bounds based on a query parameter (e.g. set in a read only field)
    (setInitialBounds &&
    setInitialBounds.initialBoundsDefinition.find(
      (d) =>
        d[setInitialBounds.queryParameter] === searchParams?.get(setInitialBounds.queryParameter),
    )
      ? setInitialBounds.initialBoundsDefinition.find(
          (d) =>
            d[setInitialBounds.queryParameter] ===
            searchParams?.get(setInitialBounds.queryParameter),
        )?.bbox
      : // generally use the normal config bounds
        config.bounds)

  const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"
  const vectorStyle = `${maptilerUrl}?key=${maptilerApiKey}`
  const satelliteStyle = `${"https://api.maptiler.com/maps/hybrid/style.json"}?key=${maptilerApiKey}`

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
        {
          id: previouslySelectedFeatureId,
          source: previouslySelectedSourceId,
          sourceLayer: "default",
        },
        { selected: false },
      )
    }

    // Set new selection state
    if (geoCategoryId !== undefined && mainMap) {
      mainMap.getMap().setFeatureState(
        {
          id: featureId,
          source: sourceId,
          [geoCategoryIdDefinition.propertyName]: geoCategoryId,
          sourceLayer: "default",
        },
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
    playwrightSendMapLoadedEvent()
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
        initialViewState={{
          bounds: initialBounds,
          fitBoundsOptions: { padding: field.state.value ? 150 : 0 },
        }}
        mapStyle={selectedLayer === "vector" ? vectorStyle : satelliteStyle}
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
        {field.form.getFieldValue(geoCategoryIdDefinition.dataKey) ? (
          <div className="absolute inset-x-20 bottom-8 rounded-sm bg-white/70 p-2 text-sm">
            <ul>
              {!isProduction && (
                <li className="font-mono">
                  <small>
                    <strong>ID:</strong>{" "}
                    {field.form.getFieldValue(geoCategoryIdDefinition.dataKey) || "Keine Auswahl"} (
                    {geoCategoryIdDefinition.propertyName})
                  </small>
                </li>
              )}
              {additionalData.map((data) => {
                const { label, dataKey, propertyName } = data
                const value = field.form.getFieldValue(dataKey)
                return (
                  <li key={dataKey} className="text-black">
                    <strong>{label}: </strong>
                    {value || "Keine Auswahl"}{" "}
                    {!isProduction && <small className="font-mono">({propertyName})</small>}
                  </li>
                )
              })}
            </ul>
          </div>
        ) : (
          <div className="absolute inset-x-20 bottom-8 rounded-sm bg-white/70 p-2 text-sm">
            {description || "Bitte treffen Sie eine Auswahl."}
          </div>
        )}
        <SurveyBackgroundSwitcher
          className="absolute left-4 top-4"
          value={selectedLayer}
          onChange={handleLayerSwitch}
        />
      </Map>
    </div>
  )
}
