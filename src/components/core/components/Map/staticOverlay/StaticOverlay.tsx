import { AllLayers, generateLayers } from "@/src/components/core/components/Map/AllLayers"
import { AllSources } from "@/src/components/core/components/Map/AllSources"
import type { StaticOverlayConfig } from "@/src/components/core/components/Map/staticOverlay/staticOverlay.types"

type Props = { config: StaticOverlayConfig }

export const StaticOverlay = ({ config }: Props) => {
  // PMTiles and remote GeoJSON overlays hit tilda-geo.de; skip sources and layers in E2E.
  if (import.meta.env.VITE_PLAYWRIGHT_ENABLED === "true") return null

  return (
    <>
      <AllSources mapData={config} />
      <AllLayers layers={generateLayers(config)} />
    </>
  )
}
