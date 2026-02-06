import { useMap } from "react-map-gl/maplibre"
import { useMapHighlight } from "../BaseMap"

export const useMarkerHover = (slug: string) => {
  const { highlightFeaturesBySlug, clearHoverState } = useMapHighlight()
  const { mainMap } = useMap()

  return {
    onMouseEnter: () => {
      if (mainMap) {
        highlightFeaturesBySlug(mainMap.getMap(), slug)
      }
    },
    onMouseLeave: () => {
      if (mainMap) {
        clearHoverState(mainMap.getMap())
      }
    },
  }
}
