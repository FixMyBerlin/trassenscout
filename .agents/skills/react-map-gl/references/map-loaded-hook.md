# Map loaded guard (useMapLoaded)

`getStyle()`, `queryRenderedFeatures()`, `setFeatureState()` etc. error or silently no-op before `onLoad`. `useMap()` returning a ref does not mean the style is ready, and mounted children do not mean ready ([react-map-gl #2123](https://github.com/visgl/react-map-gl/issues/2123)).

## Pattern (tilda-geo `useMapState.ts`)

Zustand flag set once in `onLoad`:

```tsx
// store
mapLoaded: false,
markMapLoaded: () => set((state) => (state.mapLoaded ? state : { mapLoaded: true })),
export const useMapLoaded = () => useMapStore((state) => state.mapLoaded)

// MapCanvas.tsx
<Map id="mainMap" onLoad={() => markMapLoaded()} />

// any consumer
const { mainMap } = useMap()
const mapLoaded = useMapLoaded()
useEffect(function syncSelectedFeatureStateToMap() {
  if (!mainMap || !mapLoaded) return
  // safeSetFeatureState(mainMap, …)
}, [currentSelectedFeatures, mainMap, mapLoaded])
```

## Related signals

- `mapLoaded` (`onLoad`): style + map object ready. Use for feature state, queries, bounds fit.
- `onData` / `onIdle`: tile loading UI only (`<MapGl onLoad onData={startMapDataLoading} onIdle={finishMapDataLoading} />`).
- `interactiveLayerIds` can lag the style by one tick: filter ids before `queryRenderedFeatures` ([interactive-layer-ids.md](interactive-layer-ids.md)).

## Do not

- Call `getStyle` / `queryRenderedFeatures` in render without `mapLoaded`.
- Reset `mapLoaded` on every style change unless you handle `onLoad` again after `mapStyle` updates.
