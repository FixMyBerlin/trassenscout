import type { FeatureCollection, Point } from "geojson"
import { Layer, Source } from "react-map-gl/maplibre"

const baseSelectablePointLayerId = "layer_selectable_point_features"

export const getSelectablePointLayerId = (suffix?: string) =>
  `${baseSelectablePointLayerId}${suffix ?? ""}`

export const selectablePointLayerId = getSelectablePointLayerId()

export type SelectablePointsLayerProps = {
  selectablePoints?: FeatureCollection<
    Point,
    { subsectionSlug: string; subsubsectionSlug?: string; color: string; opacity?: number }
  >
  layerIdSuffix?: string
}

export const SelectablePointsLayer = ({
  selectablePoints,
  layerIdSuffix,
}: SelectablePointsLayerProps) => {
  if (!selectablePoints || selectablePoints.features.length === 0) return null

  const layerId = getSelectablePointLayerId(layerIdSuffix)

  return (
    <Source id={layerId} key={layerId} type="geojson" data={selectablePoints}>
      <Layer
        id={layerId}
        type="circle"
        paint={{
          "circle-radius": ["case", ["has", "radius"], ["get", "radius"], 17],
          "circle-color": ["case", ["has", "color"], ["get", "color"], "black"],
          "circle-stroke-width": ["case", ["has", "border-width"], ["get", "border-width"], 0],
          "circle-stroke-color": [
            "case",
            ["has", "border-color"],
            ["get", "border-color"],
            "transparent",
          ],
          "circle-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 1],
        }}
      />
      <Layer
        id={`${layerId}-click-target`}
        type="circle"
        paint={{
          "circle-radius": ["case", ["has", "radius"], ["get", "radius"], 17],
          "circle-opacity": 0,
        }}
      />
    </Source>
  )
}
