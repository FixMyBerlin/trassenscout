import { getTildaInfraHoverContent, type TildaInfraHoverContent } from "./tildaInfraLabels"

export type TildaInfraHover = {
  featureIds: string
  longitude: number
  latitude: number
  entries: TildaInfraHoverContent[]
}

type HoveredFeature = {
  id?: string | number
  properties: Record<string, unknown> | null
}

export const getTildaInfraEntryKey = (entry: TildaInfraHoverContent) =>
  `${entry.category}|${entry.width}|${entry.surface}`

// The same lines keep their card and anchor, so moving along them doesn't re-render
export const getNextTildaInfraHover = (
  previous: TildaInfraHover | null,
  features: HoveredFeature[],
  lngLat: { lng: number; lat: number },
): TildaInfraHover | null => {
  if (features.length === 0) return null
  const ids = features.map((feature) => String(feature.properties?.id ?? feature.id))
  const featureIds = [...new Set(ids)].sort().join(",")
  if (previous?.featureIds === featureIds) return previous

  // Both sides of a street share one line; identical sides show once
  const entries = new Map<string, TildaInfraHoverContent>()
  for (const feature of features) {
    const entry = getTildaInfraHoverContent(feature.properties)
    entries.set(getTildaInfraEntryKey(entry), entry)
  }
  return { featureIds, longitude: lngLat.lng, latitude: lngLat.lat, entries: [...entries.values()] }
}
