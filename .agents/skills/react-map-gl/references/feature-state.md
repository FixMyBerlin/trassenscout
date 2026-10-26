# Feature state (`setFeatureState`)

Feature state is for visual-only flags on existing features (hover, selected, QA status colors). App truth (inspector content, URL, forms) stays in React / Zustand / URL; push highlights to the map with `setFeatureState` or a React-driven layer `filter`. Inspector panels read React features, never feature-state keys.

## Targets

Pass the `MapGeoJSONFeature` from `event.features` when you have it (carries `source`, `sourceLayer`, `id`; map instance is `event.target`). Otherwise pass `{ source, id, sourceLayer? }` from app data via `useMap()` → `mainMap.getMap()`. `sourceLayer` is required for vector/PMTiles (Trassenscout `featureStateTargetForMapSource`), omitted for GeoJSON. A wrong target is a silent no-op.

## Where to call it

| Trigger                            | Where                                                 | Example                                                                           |
| ---------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------- |
| Hover                              | `onMouseMove` / `onMouseLeave`, diff previous/current | Tilda `RegionMap.updateHover`                                                     |
| Click selection (same turn)        | `onClick`: clear previous, set new                    | Trassenscout `BaseMap`, `SwitchableMap`                                           |
| Selection from store / URL / mount | `useEffect` after `mapLoaded`: diff or reset+set      | Tilda `UpdateFeatureState`; Trassenscout `SubsubsectionMap`, `AcquisitionAreaMap` |
| External data merge (QA)           | `useEffect` + `map.on('data')` for source reload      | Tilda `useQaMapState`                                                             |

The map is an external system, so pushing React/URL selection into `setFeatureState` in an effect is legitimate sync (see skill `react-dev`). Gesture-driven updates stay in Map handlers ([map-event-handlers.md](map-event-handlers.md)).

## React filter vs feature state

- **React-driven `filter`:** selection is a React/URL list of ids; a second highlight layer with `filter={ids.length ? ['in', 'id', ...ids] : ['literal', false]}` (tilda `SourcesLayersOsmNotes.tsx`). Good for small sets.
- **`setFeatureState` + paint `case`:** hover, many features, status colors. Paint reads `['case', ['boolean', ['feature-state', 'selected'], false], '#2563eb', '#94a3b8']` (Trassenscout `AcquisitionAreaLayers.tsx`).
- Hover + selected: tilda `LayerHighlight` clones the layer and uses a multi-branch `case` (hover+selected, hover, selected, default; first true wins). Hover is set in handlers, selected is synced from React in an effect.
- Trassenscout hover alternative: `map.setGlobalStateProperty('highlightSubsubsectionSlug', …)` from `onMouseMove` (`useMapHighlight`), paint reads `['global-state', …]`. Useful when hover spans many layers without per-feature ids.

## Reset first, then apply

Feature state accumulates until cleared (`{ selected: false }`). Always turn off old features before turning on new ones.

**Diff (preferred, Tilda `UpdateFeatureState.tsx`):** keep previous selection in a ref, compare with current.

```tsx
const key = (f: MapGeoJSONFeature) => `${f.id}:::${f.layer.id}`
const previous = useRef<MapGeoJSONFeature[]>([])

useEffect(
  function syncSelectedFeatureStateToMap() {
    if (!mainMap || !mapLoaded) return
    differenceBy(previous.current, current, key).forEach((f) =>
      mainMap.setFeatureState(f, { selected: false }),
    )
    differenceBy(current, previous.current, key).forEach((f) =>
      mainMap.setFeatureState(f, { selected: true }),
    )
    previous.current = current
  },
  [current, mainMap, mapLoaded],
)
```

**Reset all, then set (Trassenscout `BaseMap`):** one click selects many related features; do it in `onClick`: clear every feature in the source (`{ source, id }`, `selected: false`), then set `selected: true` for every id in the clicked feature's group.

**Clear previous id (Trassenscout `SwitchableMap`):** one click selects one feature. In `onClick`, read previous `{ sourceId, featureId }` from form state and clear it via `mainMap.getMap().setFeatureState({ source, id }, { selected: false })`, set the clicked `feature` directly, then store `feature.source` / `feature.id` in the form.

## Tilda inspector flow

`onClick` → `replaceInspectorFeatures` + `setFeaturesParam` (Zustand + URL); `<UpdateFeatureState />` child reads the store / URL-resolved features and syncs when selection changes (guarded by `useMapLoaded()`). `LayerHighlight` waits for `mapLoaded` before mounting highlight layers.

## Requirements and limitations

- `feature.id` must be an integer or string. Vector tiles drop non-integer ids unless the source sets `promoteId` (Tilda atlas sources; Trassenscout `promoteId="featureId"` on GeoJSON). Skip calls when `feature.id` is missing or the source is not on the map yet.
- `feature-state` is allowed only in `paint`, not `layout` or `filter`. Do not expect `filter: ['==', ['feature-state', 'selected'], true]`. Use a React `filter`, a separate layer, or hide via paint (`opacity: 0`).
- Tilda QA workaround (`useQaMapState.ts`): set state to `null` for hidden items (`systemStatus` / `userStatus`) and branch in paint (`SourcesLayersQa.tsx`); re-run on source `data`.
- No geometry changes (use a separate layer or update source data).
- State survives until cleared.
- `queryRenderedFeatures`-based bulk updates only see visible tiles ([MapLibre #6213](https://github.com/maplibre/maplibre-gl-js/issues/6213)).
