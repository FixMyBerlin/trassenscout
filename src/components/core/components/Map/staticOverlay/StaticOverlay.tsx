import { AllLayers, generateLayers } from "@/src/components/core/components/Map/AllLayers"
import { AllSources } from "@/src/components/core/components/Map/AllSources"
import type { StaticOverlayConfig } from "@/src/components/core/components/Map/staticOverlay/staticOverlay.types"

type Props = { config: StaticOverlayConfig }

export const StaticOverlay = ({ config }: Props) => {
  return (
    <>
      <AllSources mapData={config} />
      <AllLayers layers={generateLayers(config)} />
    </>
  )
}
