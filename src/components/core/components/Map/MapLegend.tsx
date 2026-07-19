import { twJoin } from "tailwind-merge"
import { LegendIcon } from "@/src/components/core/components/Map/Icons/LegendIcon"
import { type LegendIconId } from "@/src/components/core/components/Map/legendIconRegistry"

export type LegendItemConfig = {
  text: string
  iconIds: LegendIconId[]
}

type LegendProps = {
  legendItemsConfig?: LegendItemConfig[]
  pinned?: boolean
}

export const MapLegend = ({ legendItemsConfig, pinned = false }: LegendProps) => {
  if (!legendItemsConfig) return null

  return (
    <section
      className={twJoin(
        "flex flex-wrap gap-x-6 gap-y-2 bg-gray-100 px-3 py-2 text-xs",
        pinned ? "border-t border-gray-200" : "rounded-b-md drop-shadow-md",
      )}
    >
      {legendItemsConfig.map((item) => {
        return (
          <div key={item.text} className="flex items-center gap-2">
            {item.iconIds.map((id) => (
              <LegendIcon key={id} iconId={id} />
            ))}
            <p>{item.text}</p>
          </div>
        )
      })}
    </section>
  )
}
