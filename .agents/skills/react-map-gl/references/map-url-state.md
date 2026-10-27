# Map URL state (`map=zoom/lat/lng`)

Viewport lives in query param `map` as `zoom/lat/lng` (`?map=12.1/52.5/13.4`), synced from the Map on `onMoveEnd`.

**URL contract** (format, zoom-aware rounding, `parseMapParam` / `serializeMapParam`, `validateSearch`, slash encoding, `loaderDeps`, server redirects, test checklist): skill `tanstack-router-conventions` → `references/map-search-param.md`. Router `parseSearch` / `stringifySearch`: `router-search-serialization.md`. Server/hot-route boundaries: `tanstack-start-conventions` → `client-server-boundaries.md`.

Reuse the shared helpers (tilda-geo: `.../useQueryState/utils/mapParam.ts`). Never wrap `serializeMapParam()` in `encodeURIComponent`.

## TanStack Router (default)

Validate once with `validateSearch`; read typed search in components. Use `@tanstack/react-pacer` for throttled high-frequency updates.

```tsx
const mapViewport = Route.useSearch({ select: (s) => s.map })
const navigate = useNavigate({ from: Route.fullPath })

<Map
  initialViewState={{ longitude: mapViewport.lng, latitude: mapViewport.lat, zoom: mapViewport.zoom }}
  onMoveEnd={(event) => {
    const { latitude, longitude, zoom } = event.viewState
    void navigate({
      search: (prev) => ({ ...prev, map: serializeMapParam({ zoom, lat: latitude, lng: longitude }) }),
      replace: true, // no history entry per pan
    })
  }}
/>
```

`replace: true` on viewport drags; default push when the user navigates to a new place.

## nuqs (Vite apps without TanStack Router)

Same parse/serialize util as the router variant.

```tsx
const mapParamParser = createParser({
  parse: (query) => parseMapParam(query),
  serialize: (object) => serializeMapParam(object),
}).withDefault(mapParamFallback)
const [mapParam, setMapParam] = useQueryState('map', mapParamParser)

// tilda RegionMap: initialViewState from mapParam (lng/lat/zoom) + onMoveEnd
onMoveEnd={(event) => {
  const { latitude, longitude, zoom } = event.viewState
  void setMapParam({ zoom, lat: latitude, lng: longitude }, { history: 'replace' })
}}
```

Register param keys in a central registry if server URL normalization must preserve them (tilda `searchParamsRegistry`).
