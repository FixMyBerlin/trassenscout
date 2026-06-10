import type { Map as MapLibreMap } from "maplibre-gl"
import { LayerType } from "@/src/components/beteiligung/form/map/BackgroundSwitcher"
import { sendPlaywrightMapLoadedEvent } from "@/src/components/beteiligung/form/map/playwrightMapLoadedEvent"
import { isMapTestMode, TEST_MAP_STYLE } from "@/src/components/core/components/Map/mapStyleConfig"
import { isDev } from "@/src/components/core/utils/isEnv"

const MAPTILER_API_KEY = "ECOoUBmpqklzSCASXxcu"
const installedMaps = new WeakSet<MapLibreMap>()

const isSurveyMapTestMode = isMapTestMode

export const getSurveyMapStyle = ({
  selectedLayer,
  maptilerUrl,
}: {
  selectedLayer: LayerType
  maptilerUrl: string
}) => {
  if (isSurveyMapTestMode()) return TEST_MAP_STYLE

  const vectorStyle = `${maptilerUrl}?key=${MAPTILER_API_KEY}`
  const satelliteStyle = `${"https://api.maptiler.com/maps/hybrid/style.json"}?key=${MAPTILER_API_KEY}`

  return selectedLayer === "vector" ? vectorStyle : satelliteStyle
}

export const installMapGrabIfTest = (map: MapLibreMap, mapId: string) => {
  const isE2E = isSurveyMapTestMode()
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
  sendPlaywrightMapLoadedEvent()
}
