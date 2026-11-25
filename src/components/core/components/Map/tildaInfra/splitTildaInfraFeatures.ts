import { TILDA_INFRA_HIT_LAYER_ID } from "./tildaInfra.const"

type LayerFeature = { layer: { id: string; type: string } }

export const splitTildaInfraFeatures = <F extends LayerFeature>(features: F[] | undefined) => {
  const otherFeatures = features?.filter((feature) => feature.layer.id !== TILDA_INFRA_HIT_LAYER_ID)
  // Trassenscout lines and points cover a TILDA line, areas don't
  const coveredByOwnFeature = otherFeatures?.some((feature) => feature.layer.type !== "fill")
  return {
    hoveredTildaInfraFeatures: coveredByOwnFeature
      ? []
      : (features?.filter((feature) => feature.layer.id === TILDA_INFRA_HIT_LAYER_ID) ?? []),
    otherFeatures,
  }
}
