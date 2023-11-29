import { MultiLineString } from "@turf/helpers"
import clsx from "clsx"
import "maplibre-gl/dist/maplibre-gl.css"
import React, { useEffect } from "react"
import Map, { Layer, Marker, Source, useMap } from "react-map-gl/maplibre"
import SurveyStaticPin from "./SurveyStaticPin"

type Props = {
  className?: string
  children?: React.ReactNode
  marker: { lng: number; lat: number }
  projectGeometry?: MultiLineString
  layerStyles?: Record<string, any>
  maptilerStyleUrl: string
}

export const SurveyStaticMap: React.FC<Props> = ({
  marker,
  className,
  children,
  projectGeometry,
  layerStyles,
  maptilerStyleUrl,
}) => {
  const { mainMap } = useMap()

  const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"
  const vectorStyle = `${maptilerStyleUrl}?key=${maptilerApiKey}`

  useEffect(() => {
    if (!mainMap) return
  }, [mainMap])

  return (
    <div className={clsx(className, "h-[230px]")}>
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
      >
        {children}
        <Marker
          style={{ cursor: "default" }}
          longitude={marker.lng}
          latitude={marker.lat}
          anchor="bottom"
        >
          <SurveyStaticPin />
          {projectGeometry && (
            <Source type="geojson" data={projectGeometry}>
              {layerStyles &&
                layerStyles.map((layer: any) => {
                  return <Layer key={layer.id} {...layer} />
                })}
            </Source>
          )}
        </Marker>
      </Map>
    </div>
  )
}
