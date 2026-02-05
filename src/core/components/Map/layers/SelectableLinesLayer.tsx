import { layerColors } from "@/src/core/components/Map/layerColors"
import type { FeatureCollection, LineString } from "geojson"
import { Layer, Source } from "react-map-gl/maplibre"

const baseSelectableLineLayerId = "layer_selectable_line_features"

export const getSelectableLineLayerId = (suffix?: string) =>
  `${baseSelectableLineLayerId}${suffix ?? ""}`

export const selectableLineLayerId = getSelectableLineLayerId()

export type SelectableLinesLayerProps = {
  selectableLines?: FeatureCollection<
    LineString,
    | {
        subsectionSlug: string
        subsubsectionSlug?: string
        color: string
        opacity?: number
        dashed?: boolean
        secondColor?: string
      }
    | {
        projectSlug: string
        color: string
        opacity?: number
        dashed?: boolean
        secondColor?: string
      }
  >
  layerIdSuffix?: string
}

export const SelectableLinesLayer = ({
  selectableLines,
  layerIdSuffix,
}: SelectableLinesLayerProps) => {
  if (!selectableLines || selectableLines.features.length === 0) return null

  const layerId = getSelectableLineLayerId(layerIdSuffix)

  return (
    <Source id={layerId} key={layerId} type="geojson" data={selectableLines}>
      <Layer
        id={`${layerId}-outline`}
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
        id={`${layerId}-bg`}
        type="line"
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
        paint={{
          "line-width": 7,
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
        id={`${layerId}-solid`}
        type="line"
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
        paint={{
          "line-width": 7,
          "line-color": ["case", ["has", "color"], ["get", "color"], "black"],
          "line-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 1],
        }}
        filter={["any", ["!", ["has", "dashed"]], ["!", ["get", "dashed"]]]}
      />
      <Layer
        id={`${layerId}-dashed`}
        type="line"
        paint={{
          "line-width": 7,
          "line-color": ["case", ["has", "color"], ["get", "color"], "black"],
          "line-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 1],
          "line-dasharray": [1, 1],
        }}
        filter={["get", "dashed"]}
      />
      <Layer
        id={`${layerId}-click-target`}
        type="line"
        layout={{
          "line-cap": "round",
          "line-join": "round",
        }}
        paint={{
          "line-width": 20,
          "line-opacity": 0,
        }}
      />
    </Source>
  )
}
