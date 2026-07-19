import { twJoin } from "tailwind-merge"
import { MapLegend, type LegendItemConfig } from "./MapLegend"

type MapFooterProps = {
  legendItemsConfig?: LegendItemConfig[]
  /** Pin legend to the bottom of a fullscreen map shell. */
  pinned?: boolean
}

export const MapFooter = ({ legendItemsConfig, pinned = false }: MapFooterProps) => {
  if (!legendItemsConfig) return null

  return (
    <div className={twJoin(pinned ? "shrink-0" : "mb-10")}>
      <MapLegend legendItemsConfig={legendItemsConfig} pinned={pinned} />
    </div>
  )
}
