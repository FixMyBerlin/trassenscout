import { BackgroundSwitcher, LayerType } from "@/src/core/components/Map/BackgroundSwitcher"
import SurveyStaticPin from "@/src/core/components/Map/SurveyStaticPin"
import "maplibre-gl/dist/maplibre-gl.css"
import { useState } from "react"
import Map, {
  Layer,
  LngLatBoundsLike,
  Marker,
  NavigationControl,
  Source,
  useMap,
} from "react-map-gl/maplibre"

type Props = {
  marker: { lat: number; lng: number } | undefined
  maptilerUrl: string
  defaultViewState?: LngLatBoundsLike
  surveySlug: string
}

export const EditableSurveyResponseFormMap: React.FC<Props> = ({
  marker,
  maptilerUrl,
  defaultViewState,
  surveySlug,
}) => {
  const { mainMap } = useMap()

  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")

  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }

  const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"

  const vectorStyle = `${maptilerUrl}?key=${maptilerApiKey}`
  const satelliteStyle = `https://api.maptiler.com/maps/hybrid/style.json?key=${maptilerApiKey}`

  return (
    <div className="h-[600px]">
      <Map
        id="mainMap"
        initialViewState={{
          latitude: marker?.lat || undefined,
          longitude: marker?.lng || undefined,
          bounds: marker ? undefined : defaultViewState,
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
              "https://api.maptiler.com/tiles/b55f82dc-7010-4b20-8fd2-8071fccf72e4/{z}/{x}/{y}.pbf?key=ECOoUBmpqklzSCASXxcu",
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
            <SurveyStaticPin />
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
