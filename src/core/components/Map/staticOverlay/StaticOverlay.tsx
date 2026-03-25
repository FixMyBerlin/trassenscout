import { AllLayers, generateLayers } from "@/src/core/components/Map/AllLayers"
import { AllSources } from "@/src/core/components/Map/AllSources"
import { filterStaticOverlayForPlacement } from "@/src/core/components/Map/staticOverlay/filterStaticOverlayForPlacement"
import type {
  StaticOverlayConfig,
  StaticOverlayPlacement,
} from "@/src/core/components/Map/staticOverlay/staticOverlay.types"
import { useMemo } from "react"

type Props = {
  config: StaticOverlayConfig
  placement: StaticOverlayPlacement
}

export const StaticOverlay = ({ config, placement }: Props) => {
  const mapData = useMemo(
    () => filterStaticOverlayForPlacement(config, placement),
    [config, placement],
  )

  return (
    <>
      <AllSources mapData={mapData} />
      <AllLayers layers={generateLayers(mapData)} />
    </>
  )
}
