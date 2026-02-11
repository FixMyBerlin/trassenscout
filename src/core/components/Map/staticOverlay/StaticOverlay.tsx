import { StaticOverlayConfig } from "@/src/core/components/Map/staticOverlay/staticOverlay.types"
import { Layer, Source } from "react-map-gl/maplibre"

type Props = { config: StaticOverlayConfig }

function generateOverlayLayers(config: StaticOverlayConfig) {
  return Object.entries(config.sources).flatMap(([sourceId, source]) =>
    source.layers.map((layer) => ({
      layerKey: `${sourceId}-${layer.id}`,
      pmTilesUrl: source.pmTilesUrl,
      layer,
    })),
  )
}

export const StaticOverlay = ({ config }: Props) => {
  const sourceUrls = [...new Set(Object.values(config.sources).map((s) => s.pmTilesUrl))]
  const layers = generateOverlayLayers(config)

  return (
    <>
      {sourceUrls.map((url) => (
        <Source key={url} id={url} type="vector" url={`pmtiles://${url}`} />
      ))}
      {layers.map(({ layerKey, pmTilesUrl, layer }) => (
        <Layer key={layerKey} {...layer} source={pmTilesUrl} source-layer="default" />
      ))}
    </>
  )
}
