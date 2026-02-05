import { layerColors } from "@/src/core/components/Map/layerColors"
import type { FeatureCollection, Point } from "geojson"
import { Layer, Source } from "react-map-gl/maplibre"

export type DotsLayerProps = {
  dots?: FeatureCollection<Point, { radius?: number }>
}

export const DotsLayer = ({ dots }: DotsLayerProps) => {
  if (!dots || dots.features.length === 0) return null

  return (
    <Source id="dots" key="dots" type="geojson" data={dots}>
      <Layer
        type="circle"
        paint={{
          "circle-color": layerColors.dot,
          "circle-radius": ["case", ["has", "radius"], ["get", "radius"], 6],
        }}
      />
    </Source>
  )
}
