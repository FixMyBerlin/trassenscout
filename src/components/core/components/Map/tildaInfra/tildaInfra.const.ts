import { mapColorTokens } from "@/src/components/core/components/Map/colors/mapColorTokens"

export const TILDA_INFRA_SOURCE_ID = "tilda-infra"
export const TILDA_INFRA_LAYER_ID = "tilda-infra-bikelanes"
// Invisible wider line, so hovering doesn't need pixel precision
export const TILDA_INFRA_HIT_LAYER_ID = "tilda-infra-bikelanes-hit"
export const TILDA_INFRA_ANCHOR_LAYER_ID = "tilda-infra-anchor"
// Below this zoom TILDA's tiles carry only styling tags (no surface), as TILDA's own inspector knows
export const TILDA_INFRA_FULL_TAGS_MIN_ZOOM = 9
export const TILDA_INFRA_TILES_URL =
  "https://tiles.tilda-geo.de/atlas_generalized_bikelanes/{z}/{x}/{y}"
export const TILDA_INFRA_SOURCE_LAYER = "bikelanes"
// TILDA's own text for this source; new tab, so open forms aren't left
export const TILDA_INFRA_ATTRIBUTION =
  '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap</a>; <a href="https://tilda-geo.de" target="_blank" rel="noopener">tilda-geo.de</a>'

export const TILDA_INFRA_LINE = {
  color: mapColorTokens.tildaInfraViolet,
  width: 2,
  dasharray: [2.5, 1.5],
}

// Working names until the PO confirms them
export const TILDA_INFRA_LABEL = "Radinfrastruktur"
export const TILDA_INFRA_INFO_TEXT =
  "TILDA zeigt die bestehende Radinfrastruktur aus OpenStreetMap. Der Link öffnet TILDA am aktuellen Kartenausschnitt."
