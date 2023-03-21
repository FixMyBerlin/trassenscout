import { multiLineString, MultiLineString } from "@turf/helpers"
import clsx from "clsx"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import React, { useEffect } from "react"
import Map, { Layer, LngLatBoundsLike, Marker, Source, useMap } from "react-map-gl"
import Pin from "./Pin"
import StaticPin from "./StaticPin"

export type ParticipationMapProps = {
  className?: string
  children?: React.ReactNode
  projectMap: {
    projectGeometry: MultiLineString
    marker: { lng: number; lat: number }
    config: {
      zoom: number
      bounds: LngLatBoundsLike
      longitude: number
      latitude: number
      boundsPadding: number
    }
  }
}

export const ParticipationStaticMap: React.FC<ParticipationMapProps> = ({
  projectMap,
  className,
  children,
}) => {
  const { mainMap } = useMap()

  const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"
  const vectorStyle = `https://api.maptiler.com/maps/a4824657-3edd-4fbd-925e-1af40ab06e9c/style.json?key=${maptilerApiKey}`

  useEffect(() => {
    if (!mainMap) return
  }, [mainMap])

  return (
    <div className={clsx(className, "h-[230px]")}>
      <Map
        id="mainMap"
        mapLib={maplibregl}
        initialViewState={{
          longitude: projectMap.marker.lng,
          latitude: projectMap.marker.lat,
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
          longitude={projectMap.marker.lng}
          latitude={projectMap.marker.lat}
          anchor="bottom"
        >
          <StaticPin />
          <Source type="geojson" data={multiLineString(projectMap.projectGeometry.coordinates)}>
            <Layer
              type="line"
              paint={{
                "line-width": 7,
                "line-color": "blue",
              }}
            />
          </Source>
        </Marker>
      </Map>
    </div>
  )
}
