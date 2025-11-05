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
  vector: "Kartenlayer einblenden",
  satellite: "Satellitenlayer einblenden",
}

type Props = {
  value: LayerType
  onChange: (_: LayerType) => void
  className: string
}

export const BackgroundSwitcher: React.FC<Props> = ({ value, onChange, className }) => {
  return (
    <div className={className}>
      <Listbox value={value} onChange={onChange}>
        {({ open }) => (
          <div className="relative mt-1">
            <ListboxButton className="relative cursor-default rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 text-left shadow-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden sm:text-sm">
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
              <ListboxOptions className="ring-opacity-5 absolute z-10 mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-gray-200 focus:outline-hidden sm:text-sm">
                {Object.keys(labels).map((id) => (
                  <ListboxOption
                    key={id}
                    className={({ active }) =>
                      clsx(
                        active ? "bg-blue-600 text-white" : "text-gray-900",
                        "relative cursor-default py-2 pr-9 pl-3 select-none",
                      )
                    }
                    value={id}
                  >
                    {({ selected, active }) => (
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
                            className={clsx(
                              active ? "text-white" : "text-blue-600",
                              "absolute inset-y-0 right-0 flex items-center pr-4",
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
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
