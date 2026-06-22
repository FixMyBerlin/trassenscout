import { LayerType } from "@/src/app/beteiligung/_components/form/map/BackgroundSwitcher"
import { sendPlaywrightMapLoadedEvent } from "@/src/app/beteiligung/_components/form/map/playwrightMapLoadedEvent"
import { isDev } from "@/src/core/utils/isEnv"
import type { Map as MapLibreMap, StyleSpecification } from "maplibre-gl"

const TEST_MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [],
}

const MAPTILER_API_KEY = "ECOoUBmpqklzSCASXxcu"
const installedMaps = new WeakSet<MapLibreMap>()

export const isSurveyMapTestMode = () => process.env.NEXT_PUBLIC_IS_TEST === "true"

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
