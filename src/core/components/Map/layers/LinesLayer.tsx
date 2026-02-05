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
      dashed?: boolean
      secondColor?: string
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
        id="lines-layer-bg"
        type="line"
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
        paint={{
          "line-width": ["case", ["has", "width"], ["get", "width"], 7],
          "line-color": [
            "case",
            ["has", "secondColor"],
            ["get", "secondColor"],
            layerColors.background,
          ],
          "line-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 0.9],
        }}
        filter={["get", "dashed"]}
      />
      <Layer
        id="lines-layer-solid"
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
        filter={["any", ["!", ["has", "dashed"]], ["!", ["get", "dashed"]]]}
      />
      <Layer
        id="lines-layer-dashed"
        type="line"
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
        paint={{
          "line-width": ["case", ["has", "width"], ["get", "width"], 7],
          "line-color": ["case", ["has", "color"], ["get", "color"], "black"],
          "line-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 1],
          "line-dasharray": [1, 1],
        }}
        filter={["get", "dashed"]}
      />
    </Source>
  )
}
