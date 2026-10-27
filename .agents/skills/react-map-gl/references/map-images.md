# Map images (`useMapImages`, `styleimagemissing`)

Symbol layers reference icons by id (`icon-image`). An id missing from the style sprite emits `styleimagemissing`. Pick a strategy:

| Strategy                              | When                                      | FMC example                                                                     |
| ------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------- |
| Proactive `addImage` (`useMapImages`) | Fixed, known icon ids                     | vzk `NO_SIGN_ICON` placeholder                                                  |
| Reactive `styleimagemissing`          | Dynamic / unbounded ids from feature data | vzk sign supports: `icon-image` = aggregation JSON, generate canvas, `addImage` |
| Style / sprite fix                    | Id should be in the built sprite          | tilda atlas styles                                                              |
| Dev warn only                         | Find missing ids in development           | tilda `RegionMap`                                                               |

Guard with `mainMap` and preferably `useMapLoaded()`.

## Proactive — `useMapImages` (vzk-bw-workspace `hooks/useMapImages.ts`)

Register before the symbol layer renders. `useEffect` because `mainMap` is often undefined on first render and image loading is async. No cleanup (images stay until the style is replaced).

```tsx
export function useMapImages({ images }: { images: MapImage[] }) {
  // { name, url, width?, height?, options? }
  const { mainMap } = useMap()

  useEffect(
    function registerMapImages() {
      if (!mainMap) return
      for (const { name, url, width, height, options } of images) {
        if (mainMap.hasImage(name)) continue
        const isSvg = url.split(".").pop() === "svg" || url.startsWith("data:image/svg+xml;")
        if (isSvg) {
          // loadImage does not handle SVG: rasterize via Image + pixelRatio
          const pixelRatio = window.devicePixelRatio
          const img = new Image(pixelRatio * (width ?? 20), pixelRatio * (height ?? 20))
          img.onload = () => {
            if (!mainMap.hasImage(name)) mainMap.addImage(name, img, { pixelRatio, ...options })
          }
          img.src = url
        } else {
          void mainMap.loadImage(url).then((image) => {
            if (!mainMap.hasImage(name)) mainMap.addImage(name, image.data, options)
          })
        }
      }
    },
    [images, mainMap],
  )
}
```

Usage: `useMapImages({ images: [{ name: 'NO_SIGN_ICON', url: signPlaceholderUrl, width: 20, height: 20 }] })` (`import url from '…svg?url'`) inside the layer component, before the `<Source>`/`<Layer>`.

SVGs need explicit `width`/`height` plus `pixelRatio` in `addImage` options, otherwise they look blurry or fail to register.

## Reactive — dynamic icons (vzk-bw `SignSupportsLayer.tsx`)

Vector tiles expose an `aggregation` property used as `icon-image` (`['get', 'aggregation']`); each distinct string is a new image id, so generate on demand. `styleimagemissing` has no `<Map>` prop: use `map.on` in a `useEffect` with `off()` cleanup.

```tsx
useEffect(
  function registerDynamicSignImages() {
    if (!mainMap || !mapLoaded) return
    const handleStyleImageMissing = async ({ id }: MapStyleImageMissingEvent) => {
      if (mainMap.hasImage(id)) return // event can fire again until addImage completes
      const image = await generateSignSupportImage(JSON.parse(id))
      if (image) mainMap.addImage(id, image, {})
    }
    mainMap.on("styleimagemissing", handleStyleImageMissing)
    return () => mainMap.off("styleimagemissing", handleStyleImageMissing)
  },
  [mainMap, mapLoaded],
)
```

Do not call `map.on('styleimagemissing', …)` in the render body (duplicates listeners every render; vzk currently does this) or in `onLoad` without `off()`. Re-subscribe when `mapStyle` changes if the map is reused (`reuseMaps`).

## Dev-only warning (tilda `RegionMap`)

Same effect with `if (!mainMap || !isDev) return` and a handler that skips `event.id === 'null'` (conditional "none" fallback emits it) and otherwise `console.warn('Missing image', id)`. Fix style or data; the symbol just does not draw until the sprite exists.

## Data-driven `icon-image`

A missing property gives a missing id and fires the event. Use `['coalesce', ['get', 'icon'], 'default-marker']` and register `default-marker` with `useMapImages` or the sprite. Skip sentinel ids (`'null'`, empty string) in handlers.
