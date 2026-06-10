import type { Map } from "maplibre-gl"

export type MapHighlightState = {
  project: string | null
  subsection: string | null
  subsubsection: string | null
}

export const CLEAR_MAP_HIGHLIGHT: MapHighlightState = {
  project: null,
  subsection: null,
  subsubsection: null,
}

export type MapHighlightLevel = keyof MapHighlightState

export function applyMapHighlight(
  map: Map | undefined,
  state: MapHighlightState,
  onStateChange?: (state: MapHighlightState) => void,
) {
  if (map) {
    map.setGlobalStateProperty("highlightProjectSlug", state.project)
    map.setGlobalStateProperty("highlightSubsectionSlug", state.subsection)
    map.setGlobalStateProperty("highlightSubsubsectionSlug", state.subsubsection)
  }
  onStateChange?.(state)
}

export function highlightStateForSlug(level: MapHighlightLevel, slug: string) {
  return { ...CLEAR_MAP_HIGHLIGHT, [level]: slug }
}

export function clearHighlightLevel(state: MapHighlightState, level: MapHighlightLevel) {
  return { ...state, [level]: null }
}
