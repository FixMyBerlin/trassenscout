# Map debug exposure (`window.__mainMap`)

Expose the MapLibre instance on `window.__mainMap` in dev and Playwright E2E so agents can inspect layer order, zoom and rendered features. Production builds must not expose it. Playwright flags, the shared `exposeMainMapForDebugging` helper, `firePlaywrightMapLoadedEvent` and test utils (`waitForMapLoad`, `getMapLayerIds`) live in skill `playwright-skill`.

Call from `onLoad`; in Map handlers `event.target` is the MapLibre map (use it, not `useMap()`):

```tsx
const handleLoad = (event: MapLibreEvent) => {
  exposeMainMapForDebugging(event.target)
}
<Map id="mainMap" onLoad={handleLoad} … />
```

```typescript
declare global {
  interface Window {
    __mainMap?: MaplibreMap
  }
}
```

Inspect via `agent_browser_eval` or `page.evaluate`:

```js
window.__mainMap?.getZoom()
window.__mainMap?.getStyle().layers.map((layer) => layer.id)
window.__mainMap?.queryRenderedFeatures({ layers: ["my-layer-id"] })
```

Fallbacks without it: annotated screenshots, `agent_browser_react_tree`, `playwright-skill`.

Do not: expose in production; pass a `MapRef` to the helper (pass the MapLibre map); call before `onLoad` ([map-loaded-hook.md](map-loaded-hook.md)).
