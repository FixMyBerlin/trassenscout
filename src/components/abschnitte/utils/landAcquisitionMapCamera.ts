import type { FitBoundsOptions, Map } from "maplibre-gl"
import { geometryBbox } from "@/src/components/core/components/Map/utils/bboxHelpers"
import type { SupportedGeometry } from "@/src/shared/geometry/geometrySchemas"

/**
 * Shared between the Grunderwerb map and the aside that selects areas via the dropdown, so both
 * can address the same map through `useMap()` without the aside importing the map component.
 */
export const SUBSUBSECTION_LAND_ACQUISITION_MAP_ID = "subsubsection-page-map"

/** Framing for a single Verhandlungsfläche — used for the fly-to and for the initial view. */
export const ACQUISITION_AREA_FIT_BOUNDS_OPTIONS = {
  padding: 80,
  maxZoom: 18,
} as const satisfies FitBoundsOptions

/** Framing for "no selection": the whole Maßnahme plus all of its Verhandlungsflächen. */
export const ACQUISITION_AREA_OVERVIEW_FIT_BOUNDS_OPTIONS = {
  padding: 60,
  maxZoom: 16,
} as const satisfies FitBoundsOptions

/**
 * Fly to a Verhandlungsfläche. Selecting one on the map and picking it from the dropdown are the
 * same intent, so they have to land in the same place — keep this the only definition.
 *
 * Called imperatively from both handlers rather than from an effect on the selection: the map is
 * reused across pages, so its `load` event does not fire again and `useMapLoaded()` stays false —
 * an effect gated on readiness never runs. See the note in SubsubsectionLandAcquisitionContent.
 */
export const fitMapToAcquisitionArea = (
  map: Pick<Map, "fitBounds">,
  geometry: SupportedGeometry,
) => {
  map.fitBounds(geometryBbox(geometry), {
    ...ACQUISITION_AREA_FIT_BOUNDS_OPTIONS,
    duration: 1000,
    linear: false,
  })
}
