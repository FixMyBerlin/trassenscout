import { radnetzStaticOverlayConfig } from "@/src/core/components/Map/staticOverlay/radnetzStaticOverlay.config"
import { ohvStaticOverlayConfig } from "./ohvStaticOverlay.config"
import type { StaticOverlayConfig } from "./staticOverlay.types"

const PROJECT_STATIC_OVERLAYS: Record<string, StaticOverlayConfig> = {
  ohv: ohvStaticOverlayConfig,
  "radnetz-brandenbrug": radnetzStaticOverlayConfig,
}

export function getStaticOverlayForProject(projectSlug: string) {
  if (!projectSlug) return undefined
  return PROJECT_STATIC_OVERLAYS[projectSlug]
}
