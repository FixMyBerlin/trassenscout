import { ohvStaticOverlayConfig } from "./ohvStaticOverlay.config"
import type { StaticOverlayConfig } from "./staticOverlay.types"

const PROJECT_STATIC_OVERLAYS: Record<string, StaticOverlayConfig> = {
  ohv: ohvStaticOverlayConfig,
}

export function getStaticOverlayForProject(projectSlug: string) {
  if (!projectSlug) return undefined
  return PROJECT_STATIC_OVERLAYS[projectSlug]
}
