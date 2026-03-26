import {
  createGeoJSONFromString,
  detectGeometryType,
  getInitialViewStateFromGeometryString,
} from "@/src/app/beteiligung/_components/form/map/utils"
import { FieldConfig } from "@/src/app/beteiligung/_shared/types"
import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { AllLayers, generateLayers } from "@/src/core/components/Map/AllLayers"
import { AllSources } from "@/src/core/components/Map/AllSources"
import { BackgroundSwitcher, LayerType } from "@/src/core/components/Map/BackgroundSwitcher"
import { getMapStyle, getVectorStyleUrl } from "@/src/core/components/Map/mapStyleConfig"
import { getStaticOverlayForProject } from "@/src/core/components/Map/staticOverlay/getStaticOverlayForProject"
import { StaticOverlay } from "@/src/core/components/Map/staticOverlay/StaticOverlay"
import SurveyStaticPin from "@/src/core/components/Map/SurveyStaticPin"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import * as pmtiles from "pmtiles"
import { useEffect, useState } from "react"
import Map, { Layer, Marker, NavigationControl, Source } from "react-map-gl/maplibre"

export type GeoCategoryFieldConfig = Extract<
  FieldConfig,
  { component: "SurveyGeoCategoryMapWithLegend" }
>

type Props = {
  marker: { lat: number; lng: number } | undefined
  geometryCategoryCoordinates?: string
  geoCategoryQuestion?: GeoCategoryFieldConfig
  configBounds: [number, number, number, number]
  maptilerUrl: string
  surveySlug: AllowedSurveySlugs
}

export const EditableSurveyResponseFormMap = ({
  marker,
  maptilerUrl,
  surveySlug,
  geometryCategoryCoordinates,
  geoCategoryQuestion,
  configBounds,
}: Props) => {
  const projectSlug = useProjectSlug()
  const staticOverlay = getStaticOverlayForProject(projectSlug ?? "")
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")
  const [mapLoading, setMapLoading] = useState(true)

  // Setup pmtiles
  useEffect(() => {
    const protocol = new pmtiles.Protocol()
    maplibregl.addProtocol("pmtiles", protocol.tile)
    return () => {
      maplibregl.removeProtocol("pmtiles")
    }
  }, [])

  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }

  const mapData = geoCategoryQuestion ? geoCategoryQuestion.props.mapProps.mapData : undefined

  const handleMapLoad = (_: maplibregl.MapLibreEvent) => {
    setMapLoading(true)
  }

  const geometryCategoryGeoJSON = geometryCategoryCoordinates
    ? createGeoJSONFromString(geometryCategoryCoordinates)
    : undefined
  const geometryCategoryGeometryType = geometryCategoryCoordinates
    ? detectGeometryType(geometryCategoryCoordinates)
    : "unknown"

  // Define different paint styles for different geometry types
  const geometryPaintMap = {
    point: {
      "circle-radius": 10,
      "circle-color": "#000000",
      "circle-opacity": 0.3,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#000000",
      "circle-stroke-opacity": 1,
    },
    lineString: {
      "line-width": 7,
      "line-color": "#000000",
      "line-opacity": 0.3,
    },
    multiLineString: {
      "line-width": 7,
      "line-color": "#000000",
      "line-opacity": 0.3,
    },
    polygon: {
      "fill-color": "#000000",
      "fill-opacity": 0.3,
      "fill-outline-color": "#000000",
    },
  }

  // Helper function to get initial view state based on geometry type
  // This solves the issue where point geometries would create invalid bboxes
  const getInitialViewState = () => {
    if (marker) {
      return {
        latitude: marker.lat,
        longitude: marker.lng,
        zoom: 12,
      }
    }

    if (geometryCategoryCoordinates) {
      return getInitialViewStateFromGeometryString(geometryCategoryCoordinates)
    }

    return {
      bounds: configBounds,
      fitBoundsOptions: { padding: 70 },
    }
  }

  const renderGeometryLayer = () => {
    if (!geometryCategoryCoordinates || geometryCategoryGeometryType === "unknown") {
      return null
    }
    switch (geometryCategoryGeometryType) {
      case "point":
        return <Layer key="geometryCategory-layer" type="circle" paint={geometryPaintMap.point} />
      case "lineString":
      case "multiLineString":
        return (
          <Layer
            key="geometryCategory-layer"
            type="line"
            paint={geometryPaintMap[geometryCategoryGeometryType]}
          />
        )
      case "polygon":
        return <Layer key="geometryCategory-layer" type="fill" paint={geometryPaintMap.polygon} />
      default:
        return null
    }
  }

  const geometryCategorySource =
    geometryCategoryCoordinates &&
    geometryCategoryGeoJSON &&
    geometryCategoryGeometryType !== "unknown" ? (
      <Source
        id="geometryCategory"
        key="geometryCategory"
        type="geojson"
        data={geometryCategoryGeoJSON}
      >
        {renderGeometryLayer()}
      </Source>
    ) : undefined

  return (
    <div className="h-[600px]">
      <Map
        id="mainMap"
        initialViewState={getInitialViewState()}
        scrollZoom={false}
        mapStyle={getMapStyle(selectedLayer, getVectorStyleUrl(maptilerUrl))}
        // Set map state for <MapData>:
        onLoad={(event) => handleMapLoad(event)}
        onIdle={() => setMapLoading(false)}
      >
        {staticOverlay && <StaticOverlay config={staticOverlay} />}
        {geometryCategorySource}
        {mapData && (
          <>
            <AllSources mapData={mapData} />
            <AllLayers layers={[...generateLayers(mapData)]} />
          </>
        )}
        {marker && (
          <Marker
            draggable={false}
            style={{ cursor: "default" }}
            longitude={marker.lng}
            latitude={marker.lat}
            anchor="bottom"
          >
            <SurveyStaticPin surveySlug={surveySlug} />
          </Marker>
        )}
        <BackgroundSwitcher
          position="top-left"
          value={selectedLayer}
          onChange={handleLayerSwitch}
        />
        <NavigationControl showCompass={false} />
      </Map>
    </div>
  )
}
