# interactiveLayerIds and event.features

react-map-gl pre-filters `event.features` (`MapGeoJSONFeature[] | undefined`) on `onClick` / `onMouseMove` / `onMouseLeave` to the layer ids in `<Map interactiveLayerIds>` (the `id` prop of `<Layer>`). Layers not listed never appear. This replaces raw MapLibre's `queryRenderedFeatures(e.point, { layers })`.

## Tilda

Ids are derived from config + URL toggles via `useInteractiveLayers()` (categories, notes, QA, datasets, mask layers; `interactive: false` excluded; mask layers added manually because `inspector.enabled: false`).

```tsx
<MapGl
  interactiveLayerIds={useInteractiveLayers()}
  onClick={handleClick}
  onMouseMove={handleMouseMove}
  onMouseLeave={handleMouseLeave}
/>
```

Click: stacked layers (fill + outline, base + highlight) can return the same feature twice, so dedupe before updating inspector/URL:

```tsx
const uniqueFeatures = uniqBy(features, (f) => `${f.source}-${f.id}`)
```

Hover: the same `features` drive `updateCursor(features)` and `updateHover(features)`.

Secondary maps that should not pick: `<MapGl interactiveLayerIds={[]} cursor="grab" />` (`NotesNewMap`).

## Keep in sync with rendered layers

The list can be one render ahead of the style. Guard manual queries:

```tsx
// tilda-geo: useSelectedFeatures.ts
const styleLayerIds = new Set(mapInstance.getLayersOrder())
const layersToQuery = interactiveLayers.filter((id) => styleLayerIds.has(id))
map.queryRenderedFeatures({ layers: layersToQuery })
```

Hiding a layer (`visibility: 'none'`) or unmounting it must also drop its id when it should no longer be clickable. Features need stable `feature.id` for selection/hover state (vector tiles need integer ids or `promoteId`, see [feature-state.md](feature-state.md)).
