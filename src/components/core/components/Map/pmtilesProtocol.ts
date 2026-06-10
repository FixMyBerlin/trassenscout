import maplibregl from "maplibre-gl"
import * as pmtiles from "pmtiles"

let pmtilesProtocolRefCount = 0
let pmtilesProtocolRegistered = false

export function retainPmtilesProtocol() {
  if (!pmtilesProtocolRegistered) {
    const protocol = new pmtiles.Protocol()
    maplibregl.addProtocol("pmtiles", protocol.tile)
    pmtilesProtocolRegistered = true
  }

  pmtilesProtocolRefCount += 1

  return function releasePmtilesProtocol() {
    pmtilesProtocolRefCount = Math.max(0, pmtilesProtocolRefCount - 1)
    if (pmtilesProtocolRefCount === 0 && pmtilesProtocolRegistered) {
      maplibregl.removeProtocol("pmtiles")
      pmtilesProtocolRegistered = false
    }
  }
}
