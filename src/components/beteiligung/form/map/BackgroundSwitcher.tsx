import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react"
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid"
import { Fragment } from "react"
import { twJoin } from "tailwind-merge"
import { formClasses } from "@/src/components/beteiligung/form/styles"
import type { ControlPosition } from "@/src/components/core/components/Map/BackgroundSwitcher/BackgroundSwitcher"

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
    <div className={twJoin(positionClasses[position], className)}>
      <Listbox value={value} onChange={onChange}>
        {({ open }) => (
          <div className="relative mt-1">
            <ListboxButton
              className={twJoin(
                "relative cursor-default rounded-md border border-gray-300 bg-white py-1 pr-10 pl-3 text-left shadow-xs sm:text-sm",
                formClasses.fieldFocus,
              )}
            >
              <span className="block truncate">{labels[value]}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDownIcon className="size-5 text-gray-400" aria-hidden="true" />
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
                    className={() =>
                      twJoin(
                        "relative cursor-default py-1 pr-9 pl-3 text-sm text-gray-900 select-none",
                        "data-focus:bg-gray-100 data-focus:outline-hidden",
                      )
                    }
                    value={id}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={twJoin(
                            selected ? "font-semibold" : "font-normal",
                            "block truncate",
                          )}
                        >
                          {labels[id]}
                        </span>

                        {selected ? (
                          <span
                            className={twJoin("absolute inset-y-0 right-0 flex items-center pr-4")}
                          >
                            <CheckIcon className="size-4" aria-hidden="true" />
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
