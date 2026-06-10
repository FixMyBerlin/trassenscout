import type { Map } from "maplibre-gl"
import { createContext, useContext } from "react"
import type { MapHighlightLevel, MapHighlightState } from "./mapHighlightState"

type MapHighlightContextValue = {
  highlight: MapHighlightState
  syncHighlight: (map: Map | undefined, next: MapHighlightState) => void
}

export const MapHighlightContext = createContext<MapHighlightContextValue | null>(null)

export function useMapHighlightContext() {
  return useContext(MapHighlightContext)
}

export function useIsMapHighlighted(level: MapHighlightLevel, slug: string) {
  const context = useMapHighlightContext()
  return context?.highlight[level] === slug
}
