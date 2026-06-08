import { isDev } from "@/src/core/utils/isEnv"

export const installMapGrabIfTest = (map: any, mapId: string) => {
  // Install in dev (for local development) and in E2E test runs.
  // E2E tests run the Next.js dev server, so isDev is already true there, but
  // the IS_TEST flag makes the intent explicit and allows future non-dev test envs.
  const isE2E = process.env.NEXT_PUBLIC_IS_TEST === "true"
  if (isDev || isE2E) {
    import("@mapgrab/map-interface").then(({ installMapGrab }) => {
      installMapGrab(map, mapId)
    })
  }
}
