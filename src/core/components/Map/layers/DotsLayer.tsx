import { layerColors } from "@/src/core/components/Map/layerColors"
import { featureCollection, point } from "@turf/helpers"
import type { Position } from "geojson"
import { Layer, Source } from "react-map-gl/maplibre"

type Dot = [number, number]

export type DotsLayerProps = {
  dots?: Position[] | Dot[]
}

export const DotsLayer = ({ dots }: DotsLayerProps) => {
  if (!dots || dots.length === 0) return null

  return (
    <Source id="dots" key="dots" type="geojson" data={featureCollection(dots.map((d) => point(d)))}>
      <Layer type="circle" paint={{ "circle-color": layerColors.dot, "circle-radius": 6 }} />
    </Source>
  )
}
