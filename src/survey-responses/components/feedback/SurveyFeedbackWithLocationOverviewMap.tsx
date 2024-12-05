import { BackgroundSwitcher, LayerType } from "@/src/core/components/Map/BackgroundSwitcher"
import SurveyStaticPin from "@/src/core/components/Map/SurveyStaticPin"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { AllowedSurveySlugs } from "@/src/survey-public/utils/allowedSurveySlugs"
import { Routes, useParam } from "@blitzjs/next"
import "maplibre-gl/dist/maplibre-gl.css"
import router from "next/router"
import { useState } from "react"
import Map, {
  Layer,
  LngLatBoundsLike,
  Marker,
  NavigationControl,
  Source,
} from "react-map-gl/maplibre"

type Props = {
  maptilerUrl: string
  defaultViewState?: LngLatBoundsLike
  selectedSurveyResponse: any
  surveyResponsesFeedbackPartWithLocation: any[]
  locationRef: number
  //todo survey clean up after survey BB
  surveySlug: AllowedSurveySlugs
}

export const SurveyFeedbackWithLocationOverviewMap: React.FC<Props> = ({
  maptilerUrl,
  defaultViewState,
  selectedSurveyResponse,
  locationRef,
  surveyResponsesFeedbackPartWithLocation,
  surveySlug,
}) => {
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")
  const surveyId = useParam("surveyId", "number")
  const projectSlug = useProjectSlug()

  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }

  const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"

  const vectorStyle = `${maptilerUrl}?key=${maptilerApiKey}`
  const satelliteStyle = `https://api.maptiler.com/maps/hybrid/style.json?key=${maptilerApiKey}`

  const handleSelect = (responseId: number) => {
    void router.push(
      Routes.SurveyResponseWithLocationPage({
        projectSlug,
        surveyId: surveyId!,
        surveyResponseId: responseId,
      }),
      undefined,
      { scroll: false },
    )
  }

  return (
    <div className="h-[100vh] overflow-clip rounded-md drop-shadow-md">
      <Map
        id="mainMap"
        initialViewState={{
          bounds: defaultViewState,
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
        {surveyResponsesFeedbackPartWithLocation.map((r) => (
          <Marker
            key={r.id}
            draggable={false}
            style={{ cursor: "pointer" }}
            longitude={r.data[locationRef].lng}
            latitude={r.data[locationRef].lat}
            anchor="bottom"
            onClick={() => handleSelect(r.id)}
          >
            <SurveyStaticPin light />
          </Marker>
        ))}
        <Marker
          key={selectedSurveyResponse.id}
          draggable={false}
          longitude={selectedSurveyResponse.data[locationRef].lng}
          latitude={selectedSurveyResponse.data[locationRef].lat}
          anchor="bottom"
        >
          <SurveyStaticPin />
        </Marker>
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
