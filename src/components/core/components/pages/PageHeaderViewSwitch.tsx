import { MapIcon, TableCellsIcon } from "@heroicons/react/24/outline"
import { twJoin } from "tailwind-merge"

const buttonClassName = "flex h-8 cursor-default items-center justify-center px-2.5 text-gray-400"

export function PageHeaderViewSwitch() {
  return (
    <div
      className="flex shrink-0 overflow-hidden rounded-md border border-gray-200"
      role="group"
      aria-label="Ansicht wechseln"
    >
      <button type="button" className={buttonClassName} aria-pressed={false} tabIndex={-1}>
        <MapIcon className="size-5" aria-hidden="true" />
        <span className="sr-only">Karte</span>
      </button>
      <button
        type="button"
        className={twJoin(buttonClassName, "bg-gray-100 text-gray-700")}
        aria-pressed={true}
        tabIndex={-1}
      >
        <TableCellsIcon className="size-5" aria-hidden="true" />
        <span className="sr-only">Liste</span>
      </button>
    </div>
  )
}
