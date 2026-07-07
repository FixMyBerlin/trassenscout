import type { Map as MapLibreMap } from "maplibre-gl"
import { LayerType } from "@/src/components/beteiligung/form/map/BackgroundSwitcher"
import { TEST_MAP_STYLE } from "@/src/components/core/components/Map/mapStyleConfig"
import { isDev, isPlaywright } from "@/src/components/core/utils/isEnv"
import { firePlaywrightMapLoadedEvent } from "@/src/components/shared/utils/playwright"

const MAPTILER_API_KEY = "ECOoUBmpqklzSCASXxcu"
const installedMaps = new WeakSet<MapLibreMap>()

export const getSurveyMapStyle = ({
  selectedLayer,
  maptilerUrl,
}: {
  selectedLayer: LayerType
  maptilerUrl: string
}) => {
  if (isPlaywright) return TEST_MAP_STYLE

  const vectorStyle = `${maptilerUrl}?key=${MAPTILER_API_KEY}`
  const satelliteStyle = `${"https://api.maptiler.com/maps/hybrid/style.json"}?key=${MAPTILER_API_KEY}`

  return selectedLayer === "vector" ? vectorStyle : satelliteStyle
}

export const installMapGrabIfTest = (map: MapLibreMap, mapId: string) => {
  const isE2E = isPlaywright
  if (!(isDev || isE2E)) return
  if (installedMaps.has(map)) return

  installedMaps.add(map)

  import("@mapgrab/map-interface")
    .then(({ installMapGrab }) => {
      installMapGrab(map, mapId)
    })
    .catch(() => {
      installedMaps.delete(map)
    })
}

export const notifyPlaywrightMapLoaded = () => {
  firePlaywrightMapLoadedEvent()
}
