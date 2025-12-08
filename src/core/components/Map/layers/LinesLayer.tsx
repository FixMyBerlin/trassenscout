import { layerColors } from "@/src/core/components/Map/layerColors"
import type { FeatureCollection, LineString } from "geojson"
import { Layer, Source } from "react-map-gl/maplibre"

export type LinesLayerProps = {
  lines?: FeatureCollection<
    LineString,
    {
      color?: string
      width?: number
      opacity?: number
    }
  >
}

export const LinesLayer = ({ lines }: LinesLayerProps) => {
  if (!lines || lines.features.length === 0) return null

  return (
    <Source id="lines" key="lines" type="geojson" data={lines}>
      <Layer
        id="lines-layer-outline"
        type="line"
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
        paint={{
          "line-width": 9,
          "line-color": layerColors.dot,
          "line-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 0.6],
        }}
      />
      <Layer
        id="lines-layer"
        type="line"
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
        paint={{
          "line-width": ["case", ["has", "width"], ["get", "width"], 7],
          "line-color": ["case", ["has", "color"], ["get", "color"], "black"],
          "line-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 1],
        }}
      />
    </Source>
  )
}
