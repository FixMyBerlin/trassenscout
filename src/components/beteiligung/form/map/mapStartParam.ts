import { z } from "zod"

/**
 * One-shot initial camera for Beteiligung geometry maps (`?mapStart=zoom/lat/lng`).
 * Read once for first paint — pans are not written back into the URL.
 */

const MapStartParamSchema = z.tuple([
  z.coerce.number().min(0).max(22),
  z.coerce.number().min(-90).max(90),
  z.coerce.number().min(-180).max(180),
])

function parseMapStartParam(query: string) {
  const parsed = MapStartParamSchema.safeParse(query.split("/"))
  if (!parsed.success) return null
  const [zoom, lat, lng] = parsed.data
  return { zoom, lat, lng }
}

/** MapLibre `initialViewState` from `?mapStart=` — read once for first paint. */
export function initialViewStateFromMapStartParam(mapStart: string | undefined) {
  if (mapStart == null) return null
  const parsed = parseMapStartParam(mapStart)
  if (!parsed) return null
  return { zoom: parsed.zoom, latitude: parsed.lat, longitude: parsed.lng }
}
