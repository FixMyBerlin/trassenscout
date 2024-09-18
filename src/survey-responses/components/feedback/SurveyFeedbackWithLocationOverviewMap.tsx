import { BackgroundSwitcher, LayerType } from "@/src/core/components/Map/BackgroundSwitcher"
import SurveyStaticPin from "@/src/core/components/Map/SurveyStaticPin"
import { Routes, useParam } from "@blitzjs/next"
import "maplibre-gl/dist/maplibre-gl.css"
import router from "next/router"
import { useState } from "react"
import Map, { LngLatBoundsLike, Marker, NavigationControl } from "react-map-gl/maplibre"

type Props = {
  maptilerUrl: string
  defaultViewState?: LngLatBoundsLike
  selectedSurveyResponse: any
  surveyResponsesFeedbackPartWithLocation: any[]
  locationRef: number
}

export const SurveyFeedbackWithLocationOverviewMap: React.FC<Props> = ({
  maptilerUrl,
  defaultViewState,
  selectedSurveyResponse,
  locationRef,
  surveyResponsesFeedbackPartWithLocation,
}) => {
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")
  const surveyId = useParam("surveyId", "number")
  const projectSlug = useParam("projectSlug", "string")

  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }

  const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"

  const vectorStyle = `${maptilerUrl}?key=${maptilerApiKey}`
  const satelliteStyle = `https://api.maptiler.com/maps/hybrid/style.json?key=${maptilerApiKey}`

  const handleSelect = (responseId: number) => {
    void router.push(
      Routes.SurveyResponseWithLocationPage({
        projectSlug: projectSlug!,
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
        // @ts-expect-error: See https://github.com/visgl/react-map-gl/issues/2310
        RTLTextPlugin={null}
      >
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
