import { Listbox, Transition } from "@headlessui/react"
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"
import { Fragment } from "react"

export type LayerType = "vector" | "satellite"

const labels: { [index: string]: string } = {
  vector: "Karte",
  satellite: "Satellit",
}

type Props = {
  value: LayerType
  onChange: (_: LayerType) => void
  className: string
}

export const SurveyBackgroundSwitcher: React.FC<Props> = ({ value, onChange, className }) => {
  return (
    <div className={className}>
      <Listbox value={value} onChange={onChange}>
        {({ open }) => (
          <div className="relative mt-1">
            <Listbox.Button className="focus:border-black-500 relative cursor-default rounded-md border border-gray-300 bg-white py-1 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--survey-primary-color)] sm:text-sm">
              <span className="block truncate">{labels[value]}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-50 mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {Object.keys(labels).map((id) => (
                  <Listbox.Option
                    key={id}
                    className={({ active }) =>
                      clsx(
                        "text-gray-900",
                        "relative cursor-default select-none py-1 pl-3 pr-9 text-sm",
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
                            className={clsx("absolute inset-y-0 right-0 flex items-center pr-4")}
                          >
                            <CheckIcon className="h-4 w-4" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        )}
      </Listbox>
    </div>
  )
}
