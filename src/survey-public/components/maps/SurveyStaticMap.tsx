import "maplibre-gl/dist/maplibre-gl.css"
import React from "react"
import Map, { Marker, useMap } from "react-map-gl/maplibre"
import SurveyStaticPin from "./SurveyStaticPin"

type Props = {
  marker: { lng: number; lat: number }
  maptilerStyleUrl: string
}

export const SurveyStaticMap: React.FC<Props> = ({ marker, maptilerStyleUrl }) => {
  const { mainMap } = useMap()
  const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"
  const vectorStyle = `${maptilerStyleUrl}?key=${maptilerApiKey}`

  return (
    <div className="h-[230px]">
      <Map
        id="mainMap"
        initialViewState={{
          longitude: marker.lng,
          latitude: marker.lat,
          zoom: 12,
        }}
        scrollZoom={false}
        boxZoom={false}
        dragRotate={false}
        dragPan={false}
        keyboard={false}
        doubleClickZoom={false}
        touchZoomRotate={false}
        cursor={"default"}
        mapStyle={vectorStyle}
        // @ts-expect-error: See https://github.com/visgl/react-map-gl/issues/2310
        RTLTextPlugin={null}
      >
        <Marker
          draggable={false}
          style={{ cursor: "default" }}
          longitude={marker.lng}
          latitude={marker.lat}
          anchor="bottom"
        >
          <SurveyStaticPin />
        </Marker>
      </Map>
    </div>
  )
}
