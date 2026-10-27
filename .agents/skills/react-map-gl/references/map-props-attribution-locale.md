# Map props: attribution, locale, RTLTextPlugin

## attributionControl={false}

Disable the default control on `<Map>` and mount your own child; this prevents duplicate controls. Tilda `RegionMap`:

```tsx
<MapGl attributionControl={false} …>
  <AttributionControl compact={true} position="bottom-left" />
</MapGl>
```

Static dataset sources can pass `attribution={attributionHtml}` on `<Source>`.

### compact starts expanded — start closed after mount

`compact` is **not** “start as the ⓘ button”. In MapLibre 6 (checked against 6.13.0, the version in tilda-geo) it means: use the compact `<details>` toggle, and collapse when the user pans. When the compact classes are applied, MapLibre sets `open` plus `.maplibregl-compact-show`, so the text is expanded. There is no `closedOnLoad` option ([maplibre-gl-js#7426](https://github.com/maplibre/maplibre-gl-js/issues/7426)).

**FMC pattern** — reference implementation: tilda-geo `app/src/components/regionen/pageRegionSlug/Map/CollapseCompactAttributionOnMount.tsx` (rendered in `RegionMap.tsx`; first version in osmcha-frontend-v2 `views/map.tsx`). Render `<AttributionControl compact>`, then a sibling whose `useEffect` runs after `useControl` and removes `.maplibregl-compact-show`. Later `sourcedata` will not re-add that class once `.maplibregl-compact` is present. Click still expands; pan still collapses.

With a style **URL** (tilda: `/api/map-style`) the attribution is still empty when the control is added (`.maplibregl-attrib-empty`). MapLibre adds `.maplibregl-compact` + `.maplibregl-compact-show` only once the first attribution text arrives, after the mount effect ran. So the effect collapses right away if `.maplibregl-compact` is already there, and otherwise watches the class with a `MutationObserver` until it appears, collapses once and disconnects:

```tsx
<Map id="mainMap" attributionControl={false} …>
  <AttributionControl compact position="bottom-left" />
  <CollapseCompactAttributionOnMount />
</Map>

export const CollapseCompactAttributionOnMount = () => {
  const { mainMap } = useMap() // keyed by <Map id="mainMap">

  useEffect(
    function collapseCompactAttribution() {
      const attribution = mainMap?.getMap().getContainer().querySelector('.maplibregl-ctrl-attrib')
      if (!attribution) return

      const collapse = () => {
        if (!attribution.classList.contains('maplibregl-compact')) return false
        attribution.classList.remove('maplibregl-compact-show')
        return true
      }
      if (collapse()) return

      const observer = new MutationObserver(() => {
        if (collapse()) observer.disconnect()
      })
      observer.observe(attribution, { attributeFilter: ['class'] })
      return () => observer.disconnect()
    },
    [mainMap],
  )

  return null
}
```

Put the collapse sibling **after** `<AttributionControl>` so effects run after the control is added. Do not collapse in `onLoad` — react-map-gl `useControl` often mounts the control after `onLoad`.

## locale

`<Map locale={{ 'NavigationControl.ZoomIn': 'Hineinzoomen', … }}>` patches control UI strings only (`Record<string, string>`, MapLibre namespaced keys, [example](https://maplibre.org/maplibre-gl-js/docs/examples/locale-switching/)). It does not change tile label language (tiles/style `text-field`). Not used in tilda today; add when product needs German control tooltips.

## RTLTextPlugin

FMC default: `<Map RTLTextPlugin={false} … />` on every Map. Never omit it: the default loads a third-party script from the Mapbox CDN at runtime (privacy/CSP risk), and FMC apps use Latin/German labels only. If RTL labels are needed, self-host the file (`RTLTextPlugin={{ pluginUrl: '/mapbox-gl-rtl-text.min.js', lazy: true }}`) and audit CSP and consent.

## Recommended FMC defaults

```tsx
<Map
  attributionControl={false}
  dragRotate={false}
  RTLTextPlugin={false}
  // locale={{ … }}   // optional: German control strings
>
  <AttributionControl compact position="bottom-left" />
  <CollapseCompactAttributionOnMount /> {/* see compact starts expanded */}
</Map>
```
