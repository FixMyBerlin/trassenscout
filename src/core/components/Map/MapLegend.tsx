import { LegendIcon } from "@/src/core/components/Map/Icons/LegendIcon"
import { type LegendIconId } from "@/src/core/components/Map/legendIconRegistry"

export type LegendItemConfig = {
  text: string
  iconIds: LegendIconId[]
}

type LegendProps = {
  legendItemsConfig?: LegendItemConfig[]
}

export const MapLegend = ({ legendItemsConfig }: LegendProps) => {
  if (!legendItemsConfig) return
  return (
    <section className="flex flex-wrap gap-x-6 gap-y-2 rounded-b-md bg-gray-100 px-3 py-2 text-xs drop-shadow-md">
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
