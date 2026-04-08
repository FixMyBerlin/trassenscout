import type maplibregl from "maplibre-gl"
import { MAX_FEATURES } from "./dealAreaMapConstants"

export function buildAlkisWfsProxyUrl(projectSlug: string, bounds: maplibregl.LngLatBounds) {
  const bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()].join(",")
  const params = new URLSearchParams({
    bbox,
    count: String(MAX_FEATURES),
  })
  return `/api/${projectSlug}/alkis-wfs-parcels?${params.toString()}`
}

export function bboxKey(bounds: maplibregl.LngLatBounds) {
  const round = (n: number) => Math.round(n * 1e5) / 1e5
  return [
    round(bounds.getWest()),
    round(bounds.getSouth()),
    round(bounds.getEast()),
    round(bounds.getNorth()),
  ].join(",")
}
