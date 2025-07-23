import { MapData } from "@/src/app/beteiligung/_shared/types"
import type {
  CircleLayerSpecification,
  FillLayerSpecification,
  HeatmapLayerSpecification,
  LineLayerSpecification,
  SymbolLayerSpecification,
} from "maplibre-gl"
import { Layer } from "react-map-gl/maplibre"

type Props = {
  layers: {
    layerKey: string
    pmTilesUrl: string
    layer: (
      | Omit<FillLayerSpecification, "source" | "source-layer" | "metadata">
      | Omit<LineLayerSpecification, "source" | "source-layer" | "metadata">
      | Omit<SymbolLayerSpecification, "source" | "source-layer" | "metadata">
      | Omit<CircleLayerSpecification, "source" | "source-layer" | "metadata">
      | Omit<HeatmapLayerSpecification, "source" | "source-layer" | "metadata">
    ) & {
      beforeId?: string
    }
  }[]
}

export const generateLayers = (layers: MapData) => {
  return Object.entries(layers.sources)
    .map(([sourceId, sources]) => {
      return sources.layers.map((layer) => {
        const layerKey = `${sourceId}-${layer.id}`
        return {
          sourceId,
          pmTilesUrl: sources.pmTilesUrl,
          layerKey,
          layer,
        }
      })
    })
    .flat(2)
}

export const AllLayers = ({ layers }: Props) => {
  return (
    <>
      {layers.map(({ layerKey, pmTilesUrl, layer }) => {
        return (
          <Layer
            {...layer}
            source={pmTilesUrl}
            key={layerKey}
            id={layerKey}
            source-layer="default"
          />
        )
      })}
    </>
  )
}
