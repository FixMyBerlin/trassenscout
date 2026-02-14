import type { Map } from "maplibre-gl"
import { useRef } from "react"
import type { MapLayerMouseEvent } from "react-map-gl/maplibre"
import type { HighlightSlugProperties, MapHighlightFeature } from "./layers/UnifiedFeaturesLayer"

type HighlightState = {
  project: string | null
  subsection: string | null
  subsubsection: string | null
}

const CLEAR_HIGHLIGHT: HighlightState = {
  project: null,
  subsection: null,
  subsubsection: null,
}

function applyHighlight(map: Map, state: HighlightState) {
  map.setGlobalStateProperty("highlightProjectSlug", state.project)
  map.setGlobalStateProperty("highlightSubsectionSlug", state.subsection)
  map.setGlobalStateProperty("highlightSubsubsectionSlug", state.subsubsection)
}

function highlightChanged(prev: HighlightState, next: HighlightState) {
  return (
    prev.project !== next.project ||
    prev.subsection !== next.subsection ||
    prev.subsubsection !== next.subsubsection
  )
}

function getHighlightFromFeature(prop: HighlightSlugProperties) {
  if (prop.subsubsectionSlug) {
    return { ...CLEAR_HIGHLIGHT, subsubsection: prop.subsubsectionSlug }
  }
  if (prop.subsectionSlug) {
    return { ...CLEAR_HIGHLIGHT, subsection: prop.subsectionSlug }
  }
  if (prop.projectSlug) {
    return { ...CLEAR_HIGHLIGHT, project: prop.projectSlug }
  }
  return CLEAR_HIGHLIGHT
}

export type MapHighlightHandlers = {
  handleMouseMove: (event: MapLayerMouseEvent) => void
  handleMouseLeave: (event: MapLayerMouseEvent) => void
}

/**
 * Encapsulates hover highlight state and handlers for the map.
 * Handlers only update MapLibre global state (highlight*Slug); caller is responsible for cursor and forwarding onMouseMove/onMouseLeave.
 */
export function useMapHighlight() {
  const previousHighlightRef = useRef<HighlightState>(CLEAR_HIGHLIGHT)

  const handleMouseMove = (event: MapLayerMouseEvent) => {
    const map = event.target
    const features = (event.features ?? []) as MapHighlightFeature[]

    if (!map) return

    const feature = features[0]
    const hasValidFeature = features.length > 0 && feature?.properties.featureId && feature?.source

    if (!hasValidFeature) {
      if (highlightChanged(previousHighlightRef.current, CLEAR_HIGHLIGHT)) {
        applyHighlight(map, CLEAR_HIGHLIGHT)
        previousHighlightRef.current = CLEAR_HIGHLIGHT
      }
      return
    }

    const next = getHighlightFromFeature(feature.properties)
    if (highlightChanged(previousHighlightRef.current, next)) {
      applyHighlight(map, next)
      previousHighlightRef.current = next
    }
  }

  const handleMouseLeave = (event: MapLayerMouseEvent) => {
    const map = event.target
    if (!map) return
    if (highlightChanged(previousHighlightRef.current, CLEAR_HIGHLIGHT)) {
      applyHighlight(map, CLEAR_HIGHLIGHT)
      previousHighlightRef.current = CLEAR_HIGHLIGHT
    }
  }

  return { handleMouseMove, handleMouseLeave }
}
