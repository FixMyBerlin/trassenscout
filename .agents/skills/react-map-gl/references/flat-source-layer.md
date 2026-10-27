# Flat Source + Layer components

Use sibling `<Source>` and `<Layer>` under `<Map>`, not `<Layer>` nested inside `<Source>`. Nesting works, but flat matches MapLibre (separate registries) and refactors easier. Never `map.addSource` / `addLayer` — see [declarative-source-layer.md](declarative-source-layer.md).

Per logical source: one `<Source id type tiles|data|url promoteId? />`, then one or more sibling `<Layer id source="…" />` whose `source` matches the Source `id`.

```tsx
<Source id="roads" type="vector" tiles={[tileUrl]} promoteId="id" />
<Layer id="roads-fill" type="fill" source="roads" source-layer="transportation"
  paint={{ 'fill-color': '#ccc' }} />
```

`id`, `type`, `source` are required; `source-layer` only for vector sources; `layout`, `paint`, `filter`, `minzoom`/`maxzoom`, `beforeId` optional.

## Layer `id` and `interactiveLayerIds`

`<Layer id>` is the MapLibre style id and the string that must appear in `<Map interactiveLayerIds>`. A typo silently breaks picking. Export a shared const when more than one module references the id (layer component, `useInteractiveLayers`, feature-state code, tests):

```tsx
// tilda-geo: SourcesLayersOsmNotes.tsx
export const osmNotesLayerId = "osm-notes-layer"
```

Same for `qaLayerId`, `internalNotesLayerId`, atlas ids via shared `createLayerKey…` helpers. Decorative layers (highlights, halos) stay out of `interactiveLayerIds`.

## React `key` vs MapLibre `id`

- Mapped lists: wrap each source + layers in `<Fragment key={sourceId}>`; `<Layer key={layer.id}>`; tilda sets `<Source key>` equal to `id`.
- Same `id`, new `key` forces a remount, for when `id` must stay stable but the source URL / layer stack must reset (tilda QA: `key={`${qaSourceId}:${vectorSourceName}--source`}`).
- Stable single Source: no `key`. Update GeoJSON `data` prop instead of bumping `key`.
- Never use `key` for visibility or style tweaks (`layout.visibility`, `paint`, `filter` props).

## Order and stability

Tilda stacks: backgrounds, system layers, main vector, URL-selected datasets, notes/QA, controls. Use `beforeId` within a group. Keep `id` and `type` stable across renders; toggle `layout.visibility`, not new ids.
