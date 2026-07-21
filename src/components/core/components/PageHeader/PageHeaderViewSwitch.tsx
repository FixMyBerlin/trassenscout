import { MapIcon, TableCellsIcon } from "@heroicons/react/24/outline"
import { twJoin } from "tailwind-merge"

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
      className="flex shrink-0 overflow-hidden rounded-md border border-gray-200"
      role="group"
      aria-label="Ansicht wechseln"
    >
      <button
        type="button"
        className={twJoin(buttonClassName, value === "map" && "bg-gray-100 text-gray-700")}
        aria-pressed={value === "map"}
        onClick={() => onChange("map")}
      >
        <MapIcon className="size-5" aria-hidden="true" />
        <span className="sr-only">Karte</span>
      </button>
      <button
        type="button"
        className={twJoin(buttonClassName, value === "list" && "bg-gray-100 text-gray-700")}
        aria-pressed={value === "list"}
        onClick={() => onChange("list")}
      >
        <TableCellsIcon className="size-5" aria-hidden="true" />
        <span className="sr-only">Liste</span>
      </button>
    </div>
  )
}
