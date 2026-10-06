import { setWorkerUrl } from "maplibre-gl"
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url"

// MapLibre v6 needs the worker URL from the bundler; without it no tiles render.
// Import this file for its side effect from every component that renders a react-map-gl `<Map>`.
// @see https://maplibre.org/maplibre-gl-js/docs/#installation
setWorkerUrl(workerUrl)
