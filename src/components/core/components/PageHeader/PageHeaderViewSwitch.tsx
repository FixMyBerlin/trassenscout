import { MapIcon, TableCellsIcon } from "@heroicons/react/24/outline"
import { twJoin } from "tailwind-merge"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"

export type ViewMode = "map" | "list"

type Props = {
  value: ViewMode
  onChange: (mode: ViewMode) => void
}

const buttonClassName =
  "flex h-8 cursor-pointer items-center justify-center px-2.5 text-gray-400 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"

export function PageHeaderViewSwitch({ value, onChange }: Props) {
  return (
    <div
      className="flex shrink-0 rounded-md border border-gray-200"
      role="group"
      aria-label="Ansicht wechseln"
    >
      <Tooltip content="Kartenansicht" variant="light" placement="top-start">
        <button
          type="button"
          className={twJoin(
            buttonClassName,
            "rounded-l-md",
            value === "map" && "bg-gray-100 text-gray-700",
          )}
          aria-label="Kartenansicht"
          aria-pressed={value === "map"}
          onClick={() => onChange("map")}
        >
          <MapIcon className="size-5" aria-hidden="true" />
        </button>
      </Tooltip>
      <Tooltip content="Listenansicht" variant="light" placement="top-start">
        <button
          type="button"
          className={twJoin(
            buttonClassName,
            "rounded-r-md",
            value === "list" && "bg-gray-100 text-gray-700",
          )}
          aria-label="Listenansicht"
          aria-pressed={value === "list"}
          onClick={() => onChange("list")}
        >
          <TableCellsIcon className="size-5" aria-hidden="true" />
        </button>
      </Tooltip>
    </div>
  )
}
