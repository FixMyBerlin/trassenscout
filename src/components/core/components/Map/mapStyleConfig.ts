import type { StyleSpecification } from "maplibre-gl"
import { isPlaywrightEnabled } from "@/src/components/shared/utils/playwright"
import type { LayerType } from "./BackgroundSwitcher/BackgroundSwitcher"

const MAPTILER_API_KEY = "ECOoUBmpqklzSCASXxcu"

/** Empty MapLibre style used in Playwright E2E to avoid external tile requests. */
export const TEST_MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [],
}

export { isPlaywrightEnabled }

/** Default vector style URL (project/subsection maps). */
const defaultVectorStyleUrl = `https://api.maptiler.com/maps/a4824657-3edd-4fbd-925e-1af40ab06e9c/style.json?key=${MAPTILER_API_KEY}`

/** Satellite/hybrid style URL (same for all maps). */
const satelliteStyleUrl = `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_API_KEY}`

/**
 * MapLibre GL style for OSM standard raster tiles (tile.openstreetmap.org).
 * Used as background layer option "osm_carto".
 */
const osmCartoStyle: StyleSpecification = {
  version: 8,
  sources: {
    "osm-raster": {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  },
  layers: [
    {
      id: "osm-raster-layer",
      type: "raster",
      source: "osm-raster",
    },
  ],
}

/**
 * Returns the map style for the given layer. Pass an optional vector style URL
 * when the map uses a survey-specific style (e.g. from maptilerUrl); otherwise
 * the default vector style is used.
 */
export function getMapStyle(layer: LayerType, vectorStyleUrl?: string) {
  if (isPlaywrightEnabled()) return TEST_MAP_STYLE

  switch (layer) {
    case "vector":
      return vectorStyleUrl ?? defaultVectorStyleUrl
    case "satellite":
      return satelliteStyleUrl
    case "osm_carto":
      return osmCartoStyle
  }
}

/** Build full MapTiler vector style URL from a base style URL (e.g. from survey config). */
export function getVectorStyleUrl(baseUrl: string) {
  return `${baseUrl}?key=${MAPTILER_API_KEY}`
}
