import { MapIcon, PanelsTopLeftIcon } from "lucide-react"
import { twJoin } from "tailwind-merge"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"
import type { ViewMode } from "@/src/shared/routing/viewModeSearch"

export type { ViewMode }

type Props = {
  value: ViewMode
  onChange: (mode: ViewMode) => void
}

const options = [
  { mode: "map", label: "Karte", name: "Kartenansicht", Icon: MapIcon },
  { mode: "list", label: "Liste", name: "Listenansicht", Icon: PanelsTopLeftIcon },
] as const

export function PageHeaderViewSwitch({ value, onChange }: Props) {
  return (
    <div
      className="isolate flex shrink-0 rounded-md shadow-xs"
      role="group"
      aria-label="Ansicht wechseln"
    >
      {options.map(({ mode, label, name, Icon }, index) => (
        <Tooltip key={mode} content={name} variant="light" placement="top-start">
          <button
            type="button"
            className={twJoin(
              "relative inline-flex cursor-pointer items-center gap-1.5 border px-3 py-2.5 text-sm font-medium focus-visible:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 sm:py-2",
              index === 0 ? "rounded-l-md" : "-ml-px rounded-r-md",
              value === mode
                ? "z-10 border-blue-500 bg-blue-500 text-white"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
            )}
            aria-label={name}
            aria-pressed={value === mode}
            onClick={() => onChange(mode)}
          >
            <Icon className="pointer-events-none size-5" strokeWidth={1.5} aria-hidden="true" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        </Tooltip>
      ))}
    </div>
  )
}
