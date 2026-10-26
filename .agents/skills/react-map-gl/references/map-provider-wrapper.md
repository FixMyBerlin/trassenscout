# MapProvider + useMap()

`useMap()` exposes the map to any descendant of `<MapProvider>`, keyed by `<Map id="…">`. Sidebars, inspectors and sync helpers often sit next to `<Map>`.

1. One parent wraps all map-related UI in `<MapProvider>`.
2. `<Map id="mainMap">` lives inside it.
3. Any component calls `const { mainMap } = useMap()` (key = `id`).
4. Never `ref={mapRef}` on `<Map>` threaded through props.

```tsx
// tilda-geo: MapInterface.tsx — MapProvider around map AND siblings
<MapProvider>
  <div className="relative flex h-full w-full flex-row gap-4">
    <RegionMap /> {/* contains <Map id="mainMap"> */}
    <SidebarInspector /> {/* useMap() — sibling of Map, works */}
  </div>
</MapProvider>
```

Child components of `<Map>` (`UpdateFeatureState`) use `useMap()` the same way. Multiple maps: each `<Map id>` registers separately (tilda note modal `id="newOsmNoteMap"` next to `"mainMap"`).

```tsx
// ❌ MapProvider only around Map — siblings get an empty useMap()
<MapProvider><Map /></MapProvider>
<Sidebar />
```

`useMap()` returns a react-map-gl `MapRef`. `mainMap?.getMap()` gives the `maplibregl.Map` for style/source APIs. Guard map calls with [map-loaded-hook.md](map-loaded-hook.md).
