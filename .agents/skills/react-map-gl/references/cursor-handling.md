# Cursor handling

Bind the `<Map cursor>` prop to state; update it from `onMouseMove` / `onMouseLeave` using `event.features` (needs `interactiveLayerIds`, see [interactive-layer-ids.md](interactive-layer-ids.md)).

```tsx
const [cursor, setCursor] = useState('grab')

<Map
  cursor={cursor}
  interactiveLayerIds={pickableLayerIds}
  onMouseMove={({ features }) => setCursor(features?.length ? 'pointer' : 'grab')}
  onMouseLeave={() => setCursor('grab')} // otherwise the cursor can stick at 'pointer'; resets to 'grab'
/>
```

- Tilda `RegionMap` filters features first (`extractInteractiveFeatures(mapParam, features)`), same as the click handler, so the cursor matches what is pickable at the current zoom.
- Non-interactive maps (`NotesNewMap`): `interactiveLayerIds={[]}`, fixed `cursor="grab"`.
- Use the `cursor` prop, not a wrapper div (works during drag).
- With `@osm-editor-kit/react-map-gl-draw`, `draw.mapProps` carries a `cursor` only when drawing needs one. Put your `cursor` before the `{...draw.mapProps}` spread so drawing wins.
