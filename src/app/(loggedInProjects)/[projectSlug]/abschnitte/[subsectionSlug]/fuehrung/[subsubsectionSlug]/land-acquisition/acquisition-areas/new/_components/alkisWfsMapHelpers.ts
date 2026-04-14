import { MAX_FEATURES } from "./acquisitionAreaMapConstants"

export function buildAlkisWfsProxyUrl(projectSlug: string, bbox: [number, number, number, number]) {
  const params = new URLSearchParams({
    bbox: bbox.join(","),
    count: String(MAX_FEATURES),
  })
  return `/api/${projectSlug}/alkis-wfs-parcels?${params.toString()}`
}
