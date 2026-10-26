# Declarative `<Source>` / `<Layer>` (not `addSource` / `addLayer`)

react-map-gl is a reactive wrapper. Sources and layers belong in the React tree, not in imperative calls on the map instance.

**Do:** declare `<Source>` / `<Layer>` as JSX under `<Map>`.
**Don't:** call `map.addSource`, `addLayer`, `removeSource`, `removeLayer` (or `setLayoutProperty` for visibility) from `onLoad`, `useEffect` or handlers. It fights react-map-gl's style diffing, drifts from React state, and misses `interactiveLayerIds`.

```tsx
// ❌ imperative / effect-driven
useEffect(() => {
  const map = mainMap?.getMap()
  if (!map || !mapLoaded) return
  map.addSource(SOURCE_ID, { type: "geojson", data: features })
  map.addLayer({ id: LAYER_ID, type: "fill", source: SOURCE_ID })
  return () => {
    map.removeLayer(LAYER_ID)
    map.removeSource(SOURCE_ID)
  }
}, [mainMap, mapLoaded, features])
```

Use JSX: [flat-source-layer.md](flat-source-layer.md). Show/hide: [layer-visibility-vs-unmount.md](layer-visibility-vs-unmount.md).

## Imperative APIs that are still OK

- `map.addImage` / `styleimagemissing` — [map-images.md](map-images.md)
- `map.setFeatureState` on existing layers — [feature-state.md](feature-state.md)
- Other guarded `getMap()` calls after load — [map-loaded-hook.md](map-loaded-hook.md)

If you reach for `getMap()` to create a source or layer, add JSX instead.
