import "maplibre-gl/dist/maplibre-gl.css"
import React, { useState } from "react"
import Map, { LngLatBoundsLike, Marker, NavigationControl, useMap } from "react-map-gl/maplibre"
import { BackgroundSwitcher, LayerType } from "src/core/components/Map/BackgroundSwitcher"
import SurveyStaticPin from "src/core/components/Map/SurveyStaticPin"

type Props = {
  marker: { lat: number; lng: number } | undefined
  maptilerStyleUrl: string
  defaultViewState?: LngLatBoundsLike
  pinColor: string
}

export const EditableSurveyResponseFormMap: React.FC<Props> = ({
  marker,
  maptilerStyleUrl,
  defaultViewState,
  pinColor,
}) => {
  const { mainMap } = useMap()

  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")

  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }

  const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"

  const vectorStyle = `${maptilerStyleUrl}?key=${maptilerApiKey}`
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
        // @ts-expect-error: See https://github.com/visgl/react-map-gl/issues/2310
        RTLTextPlugin={null}
      >
        {marker && (
          <Marker
            draggable={false}
            style={{ cursor: "default" }}
            longitude={marker.lng}
            latitude={marker.lat}
            anchor="bottom"
          >
            <SurveyStaticPin color={pinColor} />
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
