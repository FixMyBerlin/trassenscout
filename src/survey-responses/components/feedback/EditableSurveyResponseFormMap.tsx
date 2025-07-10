import { AllLayers, generateLayers } from "@/src/app/beteiligung/_components/form/map/AllLayers"
import { AllSources } from "@/src/app/beteiligung/_components/form/map/AllSources"
import {
  createBboxFromGeometryString,
  createGeoJSONFromString,
  detectGeometryType,
} from "@/src/app/beteiligung/_components/form/map/utils"
import { FieldConfig } from "@/src/app/beteiligung/_shared/types"
import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { BackgroundSwitcher, LayerType } from "@/src/core/components/Map/BackgroundSwitcher"
import SurveyStaticPin from "@/src/core/components/Map/SurveyStaticPin"
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
  maptilerUrl: string
  surveySlug: AllowedSurveySlugs
}

export const EditableSurveyResponseFormMap = ({
  marker,
  maptilerUrl,
  surveySlug,
  geometryCategoryCoordinates,
  geoCategoryQuestion,
}: Props) => {
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

  const metaDefinition = getConfigBySurveySlug(surveySlug, "meta")
  const fallbackGeometry = JSON.stringify(metaDefinition.geoCategoryFallback)

  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }

  const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"
  const vectorStyle = `${maptilerUrl}?key=${maptilerApiKey}`
  const satelliteStyle = `https://api.maptiler.com/maps/hybrid/style.json?key=${maptilerApiKey}`

  const mapData = geoCategoryQuestion ? geoCategoryQuestion.props.mapProps.mapData : undefined

  const handleMapLoad = (_: maplibregl.MapLibreEvent) => {
    setMapLoading(true)
  }

  const geometryCategoryGeoJSON = createGeoJSONFromString(
    geometryCategoryCoordinates ? geometryCategoryCoordinates : fallbackGeometry || "[]",
  )
  const geometryCategoryGeometryType = detectGeometryType(
    geometryCategoryCoordinates ? geometryCategoryCoordinates : fallbackGeometry || "[]",
  )

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
        zoom: 10.5,
      }
    }

    const geometryString = geometryCategoryCoordinates || JSON.stringify(fallbackGeometry)

    if (geometryCategoryGeometryType === "point") {
      // For points, center on the point with a reasonable zoom level
      const geoJSON = createGeoJSONFromString(geometryString)
      if (geoJSON && geoJSON.type === "Feature" && geoJSON.geometry.type === "Point") {
        const [lng, lat] = geoJSON.geometry.coordinates
        return {
          latitude: lat,
          longitude: lng,
          zoom: 12, // Adjust this zoom level as needed
        }
      }
    }

    // For lines, polygons, and other geometries, use bbox
    const bbox = createBboxFromGeometryString(geometryString)
    if (bbox) {
      return {
        bounds: bbox,
        fitBoundsOptions: { padding: 70 },
      }
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
    geometryCategoryCoordinates && geometryCategoryGeometryType !== "unknown" ? (
      <Source key="geometryCategory" type="geojson" data={geometryCategoryGeoJSON}>
        {renderGeometryLayer()}
      </Source>
    ) : undefined

  return (
    <div className="h-[600px]">
      <Map
        id="mainMap"
        initialViewState={getInitialViewState()}
        scrollZoom={false}
        mapStyle={selectedLayer === "vector" ? vectorStyle : satelliteStyle}
        // Set map state for <MapData>:
        onLoad={(event) => handleMapLoad(event)}
        onIdle={() => setMapLoading(false)}
      >
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
          className="absolute left-4 top-4"
          value={selectedLayer}
          onChange={handleLayerSwitch}
        />
        <NavigationControl showCompass={false} />
      </Map>
    </div>
  )
}
