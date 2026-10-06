import { addProtocol } from "maplibre-gl"
import * as pmtiles from "pmtiles"
import { useEffect } from "react"

/** Register the MapLibre `pmtiles://` protocol when a map mounts. */
export function usePmtilesProtocol() {
  useEffect(function registerPmtilesProtocol() {
    const protocol = new pmtiles.Protocol()
    addProtocol("pmtiles", protocol.tile)
  }, [])
}
