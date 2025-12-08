import type { FeatureCollection, Polygon } from "geojson"
import { Layer, Source } from "react-map-gl/maplibre"

const baseSelectablePolygonLayerId = "layer_selectable_polygon_features"

export const getSelectablePolygonLayerId = (suffix?: string) =>
  `${baseSelectablePolygonLayerId}${suffix ?? ""}`

export const selectablePolygonLayerId = getSelectablePolygonLayerId()

export type SelectablePolygonsLayerProps = {
  selectablePolygons?: FeatureCollection<
    Polygon,
    | { subsectionSlug: string; color: string; opacity?: number }
    | { subsectionSlug: string; subsubsectionSlug: string; color: string; opacity?: number }
    | { projectSlug: string; color: string; opacity?: number }
  >
  layerIdSuffix?: string
}

export const SelectablePolygonsLayer = ({
  selectablePolygons,
  layerIdSuffix,
}: SelectablePolygonsLayerProps) => {
  if (!selectablePolygons || selectablePolygons.features.length === 0) return null

  const layerId = getSelectablePolygonLayerId(layerIdSuffix)

  return (
    <Source id={layerId} key={layerId} type="geojson" data={selectablePolygons}>
      <Layer
        id={`${layerId}-fill`}
        type="fill"
        paint={{
          "fill-color": ["case", ["has", "color"], ["get", "color"], "black"],
          "fill-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 0.3],
        }}
      />
      <Layer
        id={`${layerId}-outline`}
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
      <Layer
        id={`${layerId}-click-target`}
        type="fill"
        paint={{
          "fill-opacity": 0,
        }}
      />
    </Source>
  )
}
