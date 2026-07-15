import { useMap } from "react-map-gl/maplibre"
import { useIsMapHighlighted, useMapHighlightContext } from "./mapHighlightContext"
import {
  clearHighlightLevel,
  highlightStateForSlug,
  type MapHighlightLevel,
} from "./mapHighlightState"

// Shared hover behavior for HTML map markers (label pills, dots):
// syncs the map highlight state on mouseenter/-leave and reports the highlight status.
export const useMarkerHighlight = (highlightLevel: MapHighlightLevel, slug: string) => {
  const { mainMap } = useMap()
  const highlightContext = useMapHighlightContext()
  const isHighlighted = useIsMapHighlighted(highlightLevel, slug)

  if (!highlightContext) {
    throw new Error("useMarkerHighlight must be used within MapHighlightContext")
  }

  const handleMouseEnter = function syncMarkerHighlightOnMouseEnter() {
    const map = mainMap?.getMap()
    const next = highlightStateForSlug(highlightLevel, slug)
    highlightContext.syncHighlight(map, next)
  }

  const handleMouseLeave = function clearMarkerHighlightOnMouseLeave() {
    const map = mainMap?.getMap()
    const next = clearHighlightLevel(highlightContext.highlight, highlightLevel)
    highlightContext.syncHighlight(map, next)
  }

  return { isHighlighted, handleMouseEnter, handleMouseLeave }
}
