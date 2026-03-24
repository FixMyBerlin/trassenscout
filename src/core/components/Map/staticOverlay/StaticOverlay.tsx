import { StaticOverlayConfig } from "@/src/core/components/Map/staticOverlay/staticOverlay.types"
import { Layer, Source } from "react-map-gl/maplibre"

type Props = { config: StaticOverlayConfig }

function generateOverlayLayers(config: StaticOverlayConfig) {
  return Object.entries(config.sources).flatMap(([sourceId, source]) =>
    source.layers.map((layer) => ({
      layerKey: `${sourceId}-${layer.id}`,
      tildaUrl: source.tildaUrl,
      layer,
    })),
  )
}

export const StaticOverlay = ({ config }: Props) => {
  const sourceUrls = [...new Set(Object.values(config.sources).map((s) => s.tildaUrl))]
  const layers = generateOverlayLayers(config)

  return (
    <>
      {sourceUrls.map((url) => (
        <Source key={url} id={url} type="vector" url={`pmtiles://${url}`} />
      ))}
      {layers.map(({ layerKey, tildaUrl, layer }) => (
        <Layer key={layerKey} {...layer} source={tildaUrl} source-layer="default" />
      ))}
    </>
  )
}
