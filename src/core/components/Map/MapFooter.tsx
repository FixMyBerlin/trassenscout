import { linkStyles } from "@/src/core/components/links/styles"
import { showMapLegendActions, showMapLegendState } from "@/src/core/store/showMapLegend.zustand"
import { MapLegend, type LegendItemConfig } from "./MapLegend"

type MapFooterProps = {
  legendItemsConfig?: LegendItemConfig[]
}

export const MapFooter = ({ legendItemsConfig }: MapFooterProps) => {
  const showMapLegend = showMapLegendState()
  const { toggleShowMapLegend } = showMapLegendActions()

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
