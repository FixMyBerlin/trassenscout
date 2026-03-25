import type { MapData } from "@/src/app/beteiligung/_shared/types"

/** Where a static overlay source may be rendered (see per-source `placements` in project configs). */
export const StaticOverlayPlacement = {
  /** Logged-in project maps: `BaseMap` (ProjectMap, SubsubsectionMap, uploads, geometry draw, etc.). */
  projectMap: "projectMap",
  /** Admin survey response edit form map only. */
  editableSurveyResponseFormMap: "editableSurveyResponseFormMap",
} as const

export type StaticOverlayPlacement =
  (typeof StaticOverlayPlacement)[keyof typeof StaticOverlayPlacement]

type MapSourceEntry = MapData["sources"][string]

export type StaticOverlaySource = MapSourceEntry & {
  /** Include this source when rendering the overlay for the given placement(s). */
  placements: readonly StaticOverlayPlacement[]
}

export type StaticOverlayConfig = {
  sources: Record<string, StaticOverlaySource>
}
