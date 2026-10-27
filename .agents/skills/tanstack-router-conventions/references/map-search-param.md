# Map search param (`?map=zoom/lat/lng`)

Canonical FMC viewport URL format from **tilda-geo** (`app/src/.../useQueryState/utils/mapParam.ts`). Use the same parse/serialize helpers on the route, in redirects, export links and tests. Map component wiring (`onMoveEnd`, `initialViewState`, MapProvider): skill `react-map-gl` (`map-url-state.md`).

## Format

`?map=<zoom>/<lat>/<lng>`, example `?map=13/52.4989/13.4329`. Order is always zoom / lat / lng (not lon/lat). `/` is **part of the value**, not a path segment.

| Part | Range    | Serialize precision                                  |
| ---- | -------- | ---------------------------------------------------- |
| zoom | 0-22     | **1** decimal                                        |
| lat  | -90-90   | by zoom: &lt;13 -> 3, 13-16 -> 4, >=17 -> 5 decimals |
| lng  | -180-180 | same as lat                                          |

## Parser / serializer (shared util)

```ts
// shared/routing/mapParam.ts (or feature-local equivalent)
import { z } from "zod"
import { roundPositionForURL } from "./roundNumber"

export type MapParam = { zoom: number; lat: number; lng: number }

const MapParamSchema = z.tuple([
  z.coerce.number().min(0).max(22),
  z.coerce.number().min(-90).max(90),
  z.coerce.number().min(-180).max(180),
])

export const parseMapParam = (query: string): MapParam | null => {
  const parsed = MapParamSchema.safeParse(query.split("/"))
  if (!parsed.success) return null
  const [zoom, lat, lng] = parsed.data
  return { zoom, lat, lng }
}

export const serializeMapParam = ({ zoom, lat, lng }: MapParam) => {
  const [roundedLat, roundedLng, roundedZoom] = roundPositionForURL(lat, lng, zoom)
  return `${roundedZoom}/${roundedLat}/${roundedLng}`
}
```

Fallback when missing/invalid (tilda Berlin default): `export const mapParamFallback = { lat: 52.5, lng: 13.4, zoom: 12.1 }`. Legacy / foreign shapes (`@52.8,13.6,12.5z`, bare strings) make `parseMapParam` return `null`.

## Rounding (always on serialize)

Always round on **serialize**, not only on parse, so replace-state pans do not churn the URL with noise digits.

```ts
const roundNumber = (number: number | string, precision?: number) => {
  if (typeof number === "string") {
    return Number.parseFloat(Number.parseFloat(number).toFixed(precision))
  }
  return Number.parseFloat(number.toFixed(precision))
}

const roundByZoom = (number: number | string, zoom: number) => {
  const latLngPrecisionByZoom = zoom >= 17 ? 5 : zoom < 13 ? 3 : 4
  return roundNumber(number, latLngPrecisionByZoom)
}

export const roundPositionForURL = (lat: number, lng: number, zoom: number) => {
  lat = roundByZoom(lat, zoom)
  lng = roundByZoom(lng, zoom)
  zoom = roundNumber(zoom, 1)
  return [lat, lng, zoom] as const
}
```

## Slashes: never `encodeURIComponent` the value

```ts
// ❌ 13.5%2F52.4918%2F13.4261
encodeURIComponent(serializeMapParam({ zoom, lat, lng }))
// ✅ map=13.5/52.4918/13.4261
serializeMapParam({ zoom, lat, lng })
```

Wire the pretty `parseSearch` / `stringifySearch` in `router.tsx` ([router-search-serialization.md](router-search-serialization.md)); its `makeSearchPretty` decodes `%2F` -> `/`, otherwise the default stringify emits `%2F`.

## `validateSearch` + writes

```ts
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { mapParamFallback, parseMapParam, serializeMapParam } from "@/shared/routing/mapParam"

const regionSearchSchema = z.object({
  map: z
    .string()
    .optional()
    .transform((s) => parseMapParam(s ?? "") ?? mapParamFallback),
})

export const Route = createFileRoute("/regionen/$regionSlug")({
  validateSearch: regionSearchSchema,
  // Do NOT put `map` in loaderDeps: pans must stay client-only (no loader re-run).
  component: RegionPage,
})
```

Writes (viewport sync) use `replace: true`, never push history per pan frame. Prefer the route-local `updateSearch` wrapper ([router-search-serialization.md](router-search-serialization.md)); throttle pans with `@tanstack/react-pacer` (`react-map-gl` -> map-url-state).

```ts
void navigate({
  search: (prev) => ({
    ...prev,
    map: serializeMapParam({ zoom, lat: latitude, lng: longitude }),
  }),
  replace: true,
})
```

## Reuse everywhere

Same `parseMapParam` / `serializeMapParam` in: route `validateSearch` / `navigate`, server redirect builders (tilda `getRegionRedirectUrl` fills missing/invalid `map` from the region default), admin / QA export deep links, manual `URLSearchParams.get('map')` reads, tests (round-trip, reject `@lat,lng,z`). Register `map` in the app search-params registry when redirects normalize URLs.

Start apps with server redirects/auth on hot map routes: do that work in the `loader` (not `beforeLoad`) — `tanstack-start-conventions` (client-server-boundaries).
