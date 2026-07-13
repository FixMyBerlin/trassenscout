import type { MapLayerMouseEvent } from "react-map-gl/maplibre"
import type { HighlightSlugProperties, MapHighlightFeature } from "./layers/UnifiedFeaturesLayer"
import {
  applyMapHighlight,
  CLEAR_MAP_HIGHLIGHT,
  type MapHighlightLevel,
  type MapHighlightState,
} from "./mapHighlightState"

export type { MapHighlightLevel }

function getHighlightFromFeatureCascade(prop: HighlightSlugProperties) {
  if (prop.subsubsectionSlug) {
    return { ...CLEAR_MAP_HIGHLIGHT, subsubsection: prop.subsubsectionSlug }
  }
  if (prop.subsectionSlug) {
    return { ...CLEAR_MAP_HIGHLIGHT, subsection: prop.subsectionSlug }
  }
  if (prop.projectSlug) {
    return { ...CLEAR_MAP_HIGHLIGHT, project: prop.projectSlug }
  }
  return CLEAR_MAP_HIGHLIGHT
}

function getHighlightFromFeature(prop: HighlightSlugProperties, level: MapHighlightLevel) {
  switch (level) {
    case "project": {
      const value = prop.projectSlug ?? null
      return value ? { ...CLEAR_MAP_HIGHLIGHT, project: value } : CLEAR_MAP_HIGHLIGHT
    }
    case "subsection": {
      const value = prop.subsectionSlug ?? null
      return value ? { ...CLEAR_MAP_HIGHLIGHT, subsection: value } : CLEAR_MAP_HIGHLIGHT
    }
    case "subsubsection": {
      const value = prop.subsubsectionSlug ?? null
      return value ? { ...CLEAR_MAP_HIGHLIGHT, subsubsection: value } : CLEAR_MAP_HIGHLIGHT
    }
  }
}

/**
 * Encapsulates hover highlight state and handlers for the map.
 * Updates MapLibre global state and optional React mirror state for marker visuals.
 * When restrictHighlightToLevel is undefined, uses cascade from feature properties (subsubsection → subsection → project).
 * When restrictHighlightToLevel is set, restricts highlighting to that level only.
 */
export function useMapHighlight(
  restrictHighlightToLevel: MapHighlightLevel | undefined,
  syncHighlight?: (map: MapLayerMouseEvent["target"], next: MapHighlightState) => void,
) {
  const applyHighlight = (map: MapLayerMouseEvent["target"], next: MapHighlightState) => {
    if (syncHighlight) {
      syncHighlight(map, next)
      return
    }
    applyMapHighlight(map, next)
  }

  const handleMouseMove = (event: MapLayerMouseEvent) => {
    const map = event.target
    const features = (event.features ?? []) as MapHighlightFeature[]

    if (!map) return

    const feature = features[0]
    const hasValidFeature = features.length > 0 && feature?.properties.featureId && feature?.source

    if (!hasValidFeature) {
      applyHighlight(map, CLEAR_MAP_HIGHLIGHT)
      return
    }

    const next =
      restrictHighlightToLevel === undefined
        ? getHighlightFromFeatureCascade(feature.properties)
        : getHighlightFromFeature(feature.properties, restrictHighlightToLevel)
    applyHighlight(map, next)
  }

  const handleMouseLeave = (event: MapLayerMouseEvent) => {
    const map = event.target
    if (!map) return
    applyHighlight(map, CLEAR_MAP_HIGHLIGHT)
  }

  return { handleMouseMove, handleMouseLeave }
}
