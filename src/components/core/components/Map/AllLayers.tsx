import { Layer } from "react-map-gl/maplibre"
import type { MapData, StaticMapLayer } from "./mapDataTypes"
import { MapSourceType } from "./mapDataTypes"

export type GeneratedMapLayer = {
  layerKey: string
  sourceId: string
  tildaUrl: string
  mapSourceType: MapSourceType
  layer: StaticMapLayer
}

type Props = {
  layers: GeneratedMapLayer[]
}

export const generateLayers = (mapData: Pick<MapData, "sources">) => {
  return Object.entries(mapData.sources)
    .map(([sourceId, sources]) => {
      return sources.layers.map((layer) => {
        const layerKey = `${sourceId}-${layer.id}`
        return {
          sourceId,
          tildaUrl: sources.tildaUrl,
          mapSourceType: sources.type,
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
      {layers.map(({ layerKey, tildaUrl, layer, mapSourceType }) => {
        return (
          <Layer
            {...layer}
            source={tildaUrl}
            key={layerKey}
            id={layerKey}
            {...(mapSourceType === MapSourceType.pmtiles
              ? ({ "source-layer": "default" } as const)
              : {})}
          />
        )
      })}
    </>
  )
}
