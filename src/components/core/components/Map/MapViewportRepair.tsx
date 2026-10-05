import { useEffect, useEffectEvent } from "react"
import { type MapProps, useMap } from "react-map-gl/maplibre"

/**
 * Reframes the map after it was attached to a container with no size. A child of `<Map>`:
 * BaseMap renders it for every app map, SwitchableMap for the survey map hidden in "none" mode.
 */
export function MapViewportRepair({ initialViewState }: Pick<MapProps, "initialViewState">) {
  const { current: map } = useMap()

  const onContainerSized = useEffectEvent(function onContainerSized() {
    if (!map) return
    map.getMap().resize()
    const bounds = initialViewState?.bounds
    if (bounds) {
      map.fitBounds(bounds, { ...initialViewState?.fitBoundsOptions, duration: 0 })
    }
  })

  useEffect(
    function reframeMapThatMountedWithoutSize() {
      if (!map) return
      const container = map.getMap().getContainer()
      if (container.clientWidth > 0 && container.clientHeight > 0) return

      const observer = new ResizeObserver(([entry]) => {
        const box = entry?.contentRect
        if (!box || box.width === 0 || box.height === 0) return
        observer.disconnect()
        onContainerSized()
      })
      observer.observe(container)
      return () => observer.disconnect()
    },
    [map],
  )

  return null
}
