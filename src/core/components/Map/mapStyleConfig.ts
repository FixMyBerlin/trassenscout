import type { StyleSpecification } from "maplibre-gl"
import type { LayerType } from "./BackgroundSwitcher"

const MAPTILER_API_KEY = "ECOoUBmpqklzSCASXxcu"

/** Default vector style URL (project/subsection maps). */
export const defaultVectorStyleUrl = `https://api.maptiler.com/maps/a4824657-3edd-4fbd-925e-1af40ab06e9c/style.json?key=${MAPTILER_API_KEY}`

/** Satellite/hybrid style URL (same for all maps). */
export const satelliteStyleUrl = `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_API_KEY}`

/**
 * MapLibre GL style for OSM standard raster tiles (tile.openstreetmap.org).
 * Used as background layer option "osm_carto".
 */
export const osmCartoStyle: StyleSpecification = {
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
