import type { MapData } from "@/src/app/beteiligung/_shared/types"
import type { StaticOverlayConfig, StaticOverlayPlacement } from "./staticOverlay.types"

/** Strips `placements` and keeps only sources that should appear for this map context. */
export function filterStaticOverlayForPlacement(
  config: StaticOverlayConfig,
  placement: StaticOverlayPlacement,
): Pick<MapData, "sources"> {
  const sources: MapData["sources"] = {}
  for (const [sourceId, entry] of Object.entries(config.sources)) {
    if (!entry.placements.includes(placement)) continue
    const { placements: _p, ...rest } = entry
    sources[sourceId] = rest
  }
  return { sources }
}
