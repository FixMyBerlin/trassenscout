import type { ControlPosition } from "@/src/core/components/Map/BackgroundSwitcher"
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react"
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid"
import { clsx } from "clsx"
import { Fragment } from "react"

export type LayerType = "vector" | "satellite"

const labels: { [index: string]: string } = {
  vector: "Karte",
  satellite: "Satellit",
}

const positionClasses: Record<ControlPosition, string> = {
  "top-left": "absolute top-4 left-4",
  "top-right": "absolute top-4 right-4",
  "bottom-left": "absolute bottom-4 left-4",
  "bottom-right": "absolute bottom-4 right-4",
}

type Props = {
  value: LayerType
  onChange: (_: LayerType) => void
  position?: ControlPosition
  className?: string
}

export const SurveyBackgroundSwitcher = ({
  value,
  onChange,
  position = "top-left",
  className,
}: Props) => {
  return (
    <div className={clsx(positionClasses[position], className)}>
      <Listbox value={value} onChange={onChange}>
        {({ open }) => (
          <div className="relative mt-1">
            <ListboxButton className="focus:border-black-500 relative cursor-default rounded-md border border-gray-300 bg-white py-1 pr-10 pl-3 text-left shadow-xs focus:ring-1 focus:ring-(--survey-primary-color) focus:outline-hidden sm:text-sm">
              <span className="block truncate">{labels[value]}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </ListboxButton>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ListboxOptions className="absolute z-50 mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-gray-200/5 focus:outline-hidden sm:text-sm">
                {Object.keys(labels).map((id) => (
                  <ListboxOption
                    key={id}
                    className={({}) =>
                      clsx(
                        "text-gray-900",
                        "relative cursor-default py-1 pr-9 pl-3 text-sm select-none",
                      )
                    }
                    value={id}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={clsx(
                            selected ? "font-semibold" : "font-normal",
                            "block truncate",
                          )}
                        >
                          {labels[id]}
                        </span>

                        {selected ? (
                          <span
                            className={clsx("absolute inset-y-0 right-0 flex items-center pr-4")}
                          >
                            <CheckIcon className="h-4 w-4" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Transition>
          </div>
        )}
      </Listbox>
    </div>
  )
}
