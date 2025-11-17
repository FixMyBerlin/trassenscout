import { isDev } from "@/src/core/utils/isEnv"

export const installMapGrabIfTest = (map: any, mapId: string) => {
  // tbd useEffect
  // atm we install it in dev mode only
  // todo have something like RUN_ONLY_IN_TEST_ENV to make it run in tests only
  // if (process.env.IS_TEST === "true") {
  if (isDev) {
    import("@mapgrab/map-interface").then(({ installMapGrab }) => {
      installMapGrab(map, mapId)
    })
  }
}
