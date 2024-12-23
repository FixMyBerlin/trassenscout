import { BackgroundSwitcher, LayerType } from "@/src/core/components/Map/BackgroundSwitcher"
import SurveyStaticPin from "@/src/core/components/Map/SurveyStaticPin"
import { AllowedSurveySlugs } from "@/src/survey-public/utils/allowedSurveySlugs"
import { getSurveyDefinitionBySurveySlug } from "@/src/survey-public/utils/getConfigBySurveySlug"
import { lineString, multiLineString, polygon } from "@turf/helpers"
import { bbox } from "@turf/turf"
import "maplibre-gl/dist/maplibre-gl.css"
import { useState } from "react"
import Map, {
  Layer,
  LngLatBoundsLike,
  Marker,
  NavigationControl,
  Source,
} from "react-map-gl/maplibre"

type Props = {
  marker: { lat: number; lng: number } | undefined
  geometryCategoryCoordinates: any
  maptilerUrl: string
  surveySlug: AllowedSurveySlugs
}

export const EditableSurveyResponseFormMap: React.FC<Props> = ({
  marker,
  maptilerUrl,
  surveySlug,
  geometryCategoryCoordinates,
}) => {
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")

  const surveyDefinition = getSurveyDefinitionBySurveySlug(surveySlug)

  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }

  const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"

  const vectorStyle = `${maptilerUrl}?key=${maptilerApiKey}`
  const satelliteStyle = `https://api.maptiler.com/maps/hybrid/style.json?key=${maptilerApiKey}`

  const geometryCategoryData =
    surveyDefinition.geometryCategoryType === "line"
      ? Array.isArray(geometryCategoryCoordinates[0][0])
        ? multiLineString(geometryCategoryCoordinates)
        : lineString(geometryCategoryCoordinates)
      : polygon(geometryCategoryCoordinates)

  const geometryCategorySource =
    surveyDefinition.geometryCategoryType === "line" ? (
      <Source key="geometryCategory" type="geojson" data={geometryCategoryData}>
        <Layer
          type="line"
          paint={{
            "line-width": 7,
            "line-color": "#994F0B",
            "line-opacity": 1,
          }}
        />
      </Source>
    ) : (
      <Source key="geometryCategory" type="geojson" data={geometryCategoryData}>
        <Layer
          type="fill"
          paint={{
            "fill-color": "#994F0B",
            "fill-opacity": 0.4,
          }}
        />
      </Source>
    )

  const geometryCategoryBounds = bbox(geometryCategoryData) as LngLatBoundsLike

  return (
    <div className="h-[600px]">
      <Map
        id="mainMap"
        initialViewState={{
          latitude: marker?.lat || undefined,
          longitude: marker?.lng || undefined,
          // if a marker/location is set, we don't need to fit the bounds
          // if we don't have a marker/location, we fit the bounds of the geometry category
          bounds: marker ? undefined : geometryCategoryBounds,
          fitBoundsOptions: { padding: { top: 50, bottom: 50, left: 50, right: 50 } },
          zoom: marker ? 10.5 : undefined,
        }}
        scrollZoom={false}
        mapStyle={selectedLayer === "vector" ? vectorStyle : satelliteStyle}
        RTLTextPlugin={false}
      >
        {/*  todo survey clean up after survey BB */}
        {surveySlug === "radnetz-brandenburg" && (
          <Source
            key="SourceNetzentwurf"
            type="vector"
            minzoom={6}
            maxzoom={10}
            tiles={[
              "https://api.maptiler.com/tiles/650084a4-a206-4873-8873-e3a43171b6ea/{z}/{x}/{y}.pbf?key=ECOoUBmpqklzSCASXxcu",
            ]}
          >
            <Layer
              id="LayerNetzentwurf"
              type="line"
              source-layer="default"
              beforeId="Fühung unklar"
              paint={{
                "line-color": "hsl(30, 100%, 50%)",
                "line-width": ["interpolate", ["linear"], ["zoom"], 0, 1, 8, 1.5, 13.8, 5],
                "line-dasharray": [3, 2],
              }}
            />
          </Source>
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
        {geometryCategoryCoordinates && geometryCategorySource}
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
