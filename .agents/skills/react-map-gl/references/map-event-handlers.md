# Map event handlers (not useEffect)

Map-driven behavior belongs on `<Map>` callback props, not `useEffect` + `map.on(…)` or polling `useMap()`. Upstream: [State management](https://visgl.github.io/react-map-gl/docs/get-started/state-management) · [Map callbacks](https://visgl.github.io/react-map-gl/docs/api-reference/maplibre/map#callbacks).

## Rule (read each Do with its Don't)

1. Do: camera, pointer, load, tile lifecycle on `<Map>` props. Don't: `useEffect` + `map.on('moveend' | 'click' | 'mousemove')`.
2. Do: read `event.features` with `interactiveLayerIds`. Don't: `useEffect` + `queryRenderedFeatures` on every pointer move, or poll with `setInterval`.
3. Do: `onMove` / `onMoveEnd` for viewport → URL ([initial-view-state.md](initial-view-state.md)). Don't: watch `map.getCenter()` in an effect.
4. Do: `onLoad` once for map ready ([map-loaded-hook.md](map-loaded-hook.md)).
5. Do: `useEffect` only to push external React state into the map after load, or for APIs without a Map prop (`styleimagemissing`). Don't: use it as the input path for user gestures.

## Use case → handler

| Use case                            | Handler                                           | FMC examples / notes                                                                                                                                                                                                                                                                                             |
| ----------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Map ready, one-time setup           | `onLoad`                                          | Tilda `RegionMap` `markMapLoaded()`, disable rotation; Trassenscout `SwitchableMap` Playwright hook. Not "tiles finished".                                                                                                                                                                                       |
| Tile/style loading UI               | `onData` + `onIdle`                               | Tilda `RegionMap`; Trassenscout `onIdle={() => setMapLoading(false)}`                                                                                                                                                                                                                                            |
| Viewport → URL / bounds             | `onMoveEnd` (+ `onMove` if UI tracks the gesture) | Tilda `RegionMap`, `NotesNewMap`. Not `onZoomEnd` alone.                                                                                                                                                                                                                                                         |
| Feature click / pick                | `onClick`                                         | Needs `interactiveLayerIds`; use `event.features`                                                                                                                                                                                                                                                                |
| Right-click                         | `onContextMenu`                                   | Trassenscout `AcquisitionAreaMap`; same `features`                                                                                                                                                                                                                                                               |
| Hover cursor / highlight            | `onMouseMove` + `onMouseLeave`                    | [cursor-handling.md](cursor-handling.md); Tilda `RegionMap` hover feature-state; Trassenscout `useMapHighlight` called from the handler                                                                                                                                                                          |
| Click selection + `setFeatureState` | `onClick` (same handler)                          | Trassenscout `BaseMap.handleClickInternal`; Tilda `RegionMap.handleClick` → store                                                                                                                                                                                                                                |
| Camera move after click             | `onClick` → `event.target.fitBounds(…)`           | Trassenscout `SubsubsectionMap`                                                                                                                                                                                                                                                                                  |
| Draggable pin                       | `<Marker onDrag / onDragEnd>`                     | Not Map `onDrag*`. Trassenscout `SwitchableMap`                                                                                                                                                                                                                                                                  |
| Drawing tools                       | `{...draw.mapProps}` on `<Map>` + `<DrawLayers>`  | [`@osm-editor-kit/react-map-gl-draw`](https://github.com/osm-editor-kit/react-map-gl-draw/tree/main/packages/react-map-gl-draw): controlled `value` / `onChange`, no `useControl`. Spread `draw.mapProps` after your own handlers; merge `onMouseMove` and `cursor`. Tilda `useCalculatorDraw`, `useReviewDraw`. |

Skip: `onRender` (fires every frame, not `onMove`); `onZoom` / `onZoomEnd` (redundant with `onMove*`); `onMouseEnter` / `onMouseOver`; controlled `onMove` + `longitude`/`latitude`/`zoom`.

## Anti-pattern vs allowed effect

```tsx
// ❌ duplicates onMoveEnd, leaks listeners
useEffect(() => {
  const map = mainMap?.getMap()
  if (!map) return
  const onMoveEnd = () => { const c = map.getCenter(); setMapParam({ lat: c.lat, lng: c.lng, zoom: map.getZoom() }) }
  map.on('moveend', onMoveEnd)
  return () => { map.off('moveend', onMoveEnd) }
}, [mainMap])

// ✅
<Map onMoveEnd={(e) => { const { latitude, longitude, zoom } = e.viewState
  void setMapParam({ lat: latitude, lng: longitude, zoom }, { history: 'replace' }) }}
  interactiveLayerIds={layerIds}
  onMouseMove={({ features }) => updateCursor(features)}
  onMouseLeave={() => updateCursor([])} />
```

Allowed: guarded effect bridging React → map after load, when selection comes from store/URL rather than the gesture (guard `mainMap && mapLoaded`, example in [map-loaded-hook.md](map-loaded-hook.md)):

- Tilda `UpdateFeatureState`: inspector selection store → `setFeatureState`
- Trassenscout `SwitchableMap`: restore form selection highlight after remount
- Trassenscout `AcquisitionAreaMap`: parent state → `setFeatureState`

Prefer the handler when gesture and map update are the same turn (Trassenscout `BaseMap` sets `selected` inside `onClick`).

Allowed, no Map prop: `styleimagemissing` subscribe with `off()` cleanup ([map-images.md](map-images.md)); `pmtiles` protocol registration on mount.

## Wiring references

Tilda `RegionMap`: `interactiveLayerIds`, `onLoad={handleLoad}`, `onData={startMapDataLoading}`, `onIdle={finishMapDataLoading}`, `onMoveEnd` (URL + bounds), `onClick` (inspector + URL features), `onMouseMove` (cursor + hover), `onMouseLeave`.

Trassenscout `BaseMap` wraps handlers once (`handleMouseMoveInternal`, `handleMouseLeaveInternal`, `handleClickInternal` run highlight, cursor, selection feature-state, then the parent's handler); consumers pass through. Domain logic may live in a hook (`useMapHighlight`), still invoked from `onMouseMove`, not an effect.
