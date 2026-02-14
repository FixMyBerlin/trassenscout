import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { showMapLegendActions, showMapLegendState } from "@/src/core/store/showMapLegend.zustand"
import { MapLegend, type LegendItemConfig } from "./MapLegend"

type MapFooterProps = {
  legendItemsConfig?: LegendItemConfig[]
}

export const MapFooter = ({ legendItemsConfig }: MapFooterProps) => {
  const showMapLegend = showMapLegendState()
  const { toggleShowMapLegend } = showMapLegendActions()

  const buttonLabel = showMapLegend ? "Legende ausblenden" : "Legende anzeigen"

  return (
    <>
      {showMapLegend && legendItemsConfig && <MapLegend legendItemsConfig={legendItemsConfig} />}
      <div className="mt-2 flex justify-end gap-2 text-xs text-gray-400">
        <button
          onClick={toggleShowMapLegend}
          className="cursor-pointer underline hover:text-gray-600"
          type="button"
        >
          {buttonLabel}
        </button>
        <IfUserCanEdit>
          <>
            {" ● "}
            <p>Schnellzugriff zum Bearbeiten über option+click (Mac) / alt+click (Windows)</p>
          </>
        </IfUserCanEdit>
      </div>
    </>
  )
}
