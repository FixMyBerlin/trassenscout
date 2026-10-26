---
name: react-map-gl
description: >-
  react-map-gl/maplibre patterns for FMC geo apps: declarative Source/Layer (never addSource/addLayer),
  MapProvider + useMap(), interactiveLayerIds, flat Source/Layer, map-loaded guard, window.__mainMap debug
  exposure, Map event handlers (not useEffect), URL map state, initialViewState, cursor, feature state,
  missing images. Use when building or reviewing Map components, layers, click/hover handlers,
  setFeatureState, map URL sync, or agent/test map inspection in TanStack Start / Vite apps.
  Reference implementation: tilda-geo/app.
---

# react-map-gl (MapLibre)

Conventions for `react-map-gl/maplibre` in FixMyBerlin / FMC projects. Import from `react-map-gl/maplibre` (not `react-map-gl` alone). Always import `maplibre-gl/dist/maplibre-gl.css`.

```tsx
import "maplibre-gl/dist/maplibre-gl.css"
import { MapProvider, Map, Source, Layer, useMap } from "react-map-gl/maplibre"
```

## Rules

| Topic             | Rule                                                                                                                                                                                                     |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sources / layers  | `<Source>` + `<Layer>` in JSX only. Never `map.addSource` / `map.addLayer` (or remove\*) for app data. Show/hide via `layout.visibility` or conditional render.                                          |
| Layer structure   | Flat siblings: one `<Source>` per source id, then `<Layer>` siblings (not nested).                                                                                                                       |
| Map events        | Camera, pointer, load, tile lifecycle go on `<Map>` callback props. Not `useEffect` + `map.on(…)`. `useEffect` only for React → map sync after load, or events without a Map prop (`styleimagemissing`). |
| Map access        | Wrap app map UI in `<MapProvider>`. `useMap()` keyed by `<Map id="…">`. Never pass `ref` to `<Map>` for child access.                                                                                    |
| Map ready         | Guard `getStyle`, `queryRenderedFeatures`, `setFeatureState` with `useMapLoaded()` (set in `onLoad`).                                                                                                    |
| Debug exposure    | In `onLoad`, call `exposeMainMapForDebugging(event.target)` (dev + Playwright only). Agents/tests read `window.__mainMap`.                                                                               |
| Clicks            | Layer ids in `interactiveLayerIds`; read `event.features`. No `queryRenderedFeatures` for primary click picking unless syncing URL features.                                                             |
| Feature highlight | Inspector/form truth in React; map tint via `setFeatureState` (paint) or React `filter` layer. Clear old state before applying new.                                                                      |
| Attribution       | `attributionControl={false}` on `<Map>`, `<AttributionControl compact>` as child. `RTLTextPlugin={false}` on every `<Map>`.                                                                              |
| Viewport URL      | `zoom/lat/lng` with zoom-aware rounding; write on `onMoveEnd` with `history: 'replace'`.                                                                                                                 |
| View state        | Uncontrolled `initialViewState` seeded from URL; no mirrored viewState in React unless programmatic camera is needed.                                                                                    |

## Which file to read

Read only the file for your task.

| Task                                                      | Read                                                  |
| --------------------------------------------------------- | ----------------------------------------------------- |
| Add or review `<Source>` / `<Layer>`, remove `addSource`  | `declarative-source-layer.md`, `flat-source-layer.md` |
| Show/hide layers                                          | `layer-visibility-vs-unmount.md`                      |
| Click/hover handler, choose a `<Map>` callback            | `map-event-handlers.md`, `interactive-layer-ids.md`   |
| Cursor over features                                      | `cursor-handling.md`                                  |
| Child/sibling needs the map instance                      | `map-provider-wrapper.md`                             |
| `getStyle` / `queryRenderedFeatures` before load          | `map-loaded-hook.md`                                  |
| Agent/E2E map inspection                                  | `map-debug-exposure.md`                               |
| Selected/hovered feature highlight, `setFeatureState`     | `feature-state.md`                                    |
| Initial camera, fitBounds, bounds                         | `initial-view-state.md`                               |
| `?map=` URL sync                                          | `map-url-state.md`                                    |
| Attribution, locale, RTL text plugin                      | `map-props-attribution-locale.md`                     |
| Missing or dynamic icons, `styleimagemissing`, `addImage` | `map-images.md`                                       |

All files are in `references/`. Pair with skills `tanstack-router-conventions` (`?map=` contract), `zustand-state-management` (`useMapLoaded` store), `playwright-skill` (E2E map helpers).

## Review checklist

- [ ] No `addSource` / `addLayer` / `removeSource` / `removeLayer` / `setLayoutProperty` for app data; flat `<Source>` + `<Layer>`
- [ ] `<MapProvider>` parent, `useMap()`, no `ref` on `<Map>`
- [ ] No `useEffect` + `map.on` for move/click/hover; viewport sync on `onMoveEnd` / `onMove`
- [ ] Effects touching the map are React → map sync guarded by `mainMap` + `mapLoaded`
- [ ] `onLoad` sets map-ready flag and calls `exposeMainMapForDebugging`
- [ ] Every pickable layer id is in `interactiveLayerIds`; handlers use `event.features`
- [ ] Old feature state cleared before new applied; features have ids (`promoteId` for vector)
- [ ] `attributionControl={false}` + child `<AttributionControl>`; `RTLTextPlugin={false}`
- [ ] URL: shared `parseMapParam` / `serializeMapParam`, `replace` on pan/zoom, no `encodeURIComponent` around the serialized value
- [ ] Fixed icons via `useMapImages`; dynamic icons via `styleimagemissing` in `useEffect` with `off()` cleanup and `hasImage` guard
