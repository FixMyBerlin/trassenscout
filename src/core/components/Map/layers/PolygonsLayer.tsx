import type { FeatureCollection, Polygon } from "geojson"
import { Layer, Source } from "react-map-gl/maplibre"

const polygonLayerId = "layer_polygon_features"

export type PolygonsLayerProps = {
  polygons?: FeatureCollection<
    Polygon,
    {
      color?: string
      opacity?: number
    }
  >
}

export const PolygonsLayer = ({ polygons }: PolygonsLayerProps) => {
  if (!polygons || polygons.features.length === 0) return null

  return (
    <Source id={polygonLayerId} key={polygonLayerId} type="geojson" data={polygons}>
      <Layer
        id={`${polygonLayerId}-fill`}
        type="fill"
        paint={{
          "fill-color": ["case", ["has", "color"], ["get", "color"], "black"],
          "fill-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 0.3],
        }}
      />
      <Layer
        id={`${polygonLayerId}-outline`}
        type="line"
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
        paint={{
          "line-width": 3,
          "line-color": ["case", ["has", "color"], ["get", "color"], "black"],
          "line-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 0.8],
        }}
      />
    </Source>
  )
}
