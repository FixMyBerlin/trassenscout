import { subsectionColors } from "@/src/core/components/Map/colors/subsectionColors"
import { subsubsectionColors } from "@/src/core/components/Map/colors/subsubsectionColors"

/** Shared color config lookup for map layers (UnifiedFeaturesLayer, LineEndPointsLayer). */
export const mapLayerColorConfigs = {
  subsection: subsectionColors,
  subsubsection: subsubsectionColors,
} as const
