import type { MapData } from "@/src/app/beteiligung/_shared/types"

/** Same shape as `MapData.sources` — used for display-only overlays. */
export type StaticOverlayConfig = Pick<MapData, "sources">
