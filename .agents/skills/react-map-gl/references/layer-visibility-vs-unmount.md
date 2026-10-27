# layout.visibility vs unmounting layers

Two declarative ways to hide content: `layout: { visibility: 'none' }` on `<Layer>` (stays in style) or stop rendering `<Source>` / `<Layer>` (removed from style). Never `map.addLayer` / `setLayoutProperty` ([declarative-source-layer.md](declarative-source-layer.md)).

- **Atlas (default):** all category layers stay mounted, `visibility: categoryActive && styleActive ? 'visible' : 'none'`. Cheap toggle, stable ids for `interactiveLayerIds` / `beforeId`, a shared source is not torn down. MapLibre only requests tiles for sources used by a visible layer.
- **Static datasets (alternative):** only URL-selected datasets render, others `return null` (`SourcesLayersStaticDatasets.tsx`). Frees memory for heavy, rarely used PMTiles, but remount re-fetches.

Prefer `visibility` for frequently toggled layers; unmount for heavy, rarely shown, URL-driven sets.

## interactiveLayerIds coupling

`visibility: 'none'` does not remove a layer from `interactiveLayerIds`; drop the id yourself if hidden layers should not be pickable. Unmounted layers must also be dropped from the list (see the style-sync guard in [interactive-layer-ids.md](interactive-layer-ids.md)).

Do not bake `layout.visibility` into static dataset JSON (can leave layers permanently hidden); drive it from React.
