import { twJoin } from "tailwind-merge"
import { MapTooltipPopup } from "@/src/components/core/components/Map/MapTooltipPopup"
import { getTildaInfraEntryKey, type TildaInfraHover } from "./tildaInfraHover"

type Props = { hover: TildaInfraHover }

export const TildaInfraHoverCard = ({ hover }: Props) => {
  return (
    <MapTooltipPopup
      longitude={hover.longitude}
      latitude={hover.latitude}
      flip
      contentClassName="max-w-64 text-left whitespace-normal"
    >
      {hover.entries.map((entry, index) => (
        <div
          key={getTildaInfraEntryKey(entry)}
          className={twJoin(index > 0 && "mt-1 border-t border-gray-200 pt-1")}
        >
          <p className="font-semibold">{entry.category}</p>
          <p>Breite: {entry.width}</p>
          <p>Oberfläche: {entry.surface}</p>
        </div>
      ))}
    </MapTooltipPopup>
  )
}
