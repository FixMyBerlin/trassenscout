import { subsectionColors } from "@/src/core/components/Map/colors/subsectionColors"
import { subsubsectionColors } from "@/src/core/components/Map/colors/subsubsectionColors"

/** Shared color config lookup for map layers (LinesLayer, PolygonsLayer, PointsLayer, LineEndPointsLayer). */
export const mapLayerColorConfigs = {
  subsection: subsectionColors,
  subsubsection: subsubsectionColors,
} as const
