import { linkStyles } from "@/src/components/core/components/links/styles"
import {
  useMapLegendActions,
  useShowMapLegend,
} from "@/src/components/core/components/Map/map-legend-store"
import { MapLegend, type LegendItemConfig } from "./MapLegend"

type MapFooterProps = {
  legendItemsConfig?: LegendItemConfig[]
}

export const MapFooter = ({ legendItemsConfig }: MapFooterProps) => {
  const showMapLegend = useShowMapLegend()
  const { toggleShowMapLegend } = useMapLegendActions()

  const buttonLabel = showMapLegend ? "Kartenlegende ausblenden" : "Kartenlegende anzeigen"

  return (
    <>
      {showMapLegend && legendItemsConfig && <MapLegend legendItemsConfig={legendItemsConfig} />}
      <div className="mt-2 flex justify-between gap-2 text-xs text-gray-400">
        <button
          onClick={toggleShowMapLegend}
          className={`cursor-pointer ${linkStyles}`}
          type="button"
        >
          {buttonLabel}
        </button>
      </div>
    </>
  )
}
