# initialViewState and camera control

FMC standard: uncontrolled map + URL as source of truth (`initialViewState` seeded from the URL param, `onMoveEnd` writes back; code in [map-url-state.md](map-url-state.md)). Not mirrored React viewState.

| Pattern                                               | Use                                        | Tilda                                                             |
| ----------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------- |
| `initialViewState` from URL, handler writes URL       | Shareable viewport                         | `RegionMap` (`onMoveEnd`), `NotesNewMap` (`onMove` + `onMoveEnd`) |
| `initialViewState` with `bounds` + `fitBoundsOptions` | Open framed on a feature, first frame only | `NotesNewMap`                                                     |
| Controlled `longitude`/`latitude`/`zoom`              | Rare, camera mirrors React every frame     | not used                                                          |
| `hash` prop                                           | Never; conflicts with `?map=`              | comment in `RegionMap`                                            |

- Do not also pass `longitude`/`latitude`/`zoom` with `initialViewState`; that forces controlled mode.
- Pass `{ history: 'replace' }` / `replace: true` on every write. `onMoveEnd` alone is enough for the main map; wire `onMove` and `onMoveEnd` to the same handler when UI must track the viewport during the gesture (`NotesNewMap` fixed marker).
- Bounds: `initialViewState={{ bounds: bbox(geometry), fitBoundsOptions: { padding: 100, maxZoom: 17 } }}`. `initialViewState` is first-frame only; later moves use map methods.
- Both maps `return null` until the URL param is parsed, to avoid an undefined center.

## Programmatic camera (after load)

`const { mainMap } = useMap()` (`MapRef`; `mainMap.fitBounds` equals `mainMap.getMap().fitBounds`). In handlers use `event.target` (the MapLibre map). Guard with `useMapLoaded()` ([map-loaded-hook.md](map-loaded-hook.md)).

```tsx
// onClick: event.target is the MapLibre map (Trassenscout SubsubsectionMap)
const geometry = event.features?.at(0)?.geometry
const [w, s, e, n] = bbox(geometry)
event.target.fitBounds(
  [
    [w, s],
    [e, n],
  ],
  { padding: 60, duration: 1000 },
)
```

From a sibling ("zoom to selection" button, `?f=` deep link): `if (!mainMap || !mapLoaded || features.length === 0) return`, then `mainMap.fitBounds(…, { padding: 40, maxZoom: 16 })`.

`fitBounds` / `flyTo` still fire `onMoveEnd`, so the new viewport is written to `?map=` (usually wanted). To skip, filter in the write handler (rare).

Anti-patterns: controlled `viewState` + `initialViewState` together; `hash` with custom `?map=`; `fitBounds` in render (run from a handler or user action).
