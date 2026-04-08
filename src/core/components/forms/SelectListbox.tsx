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

type SelectListboxOption<T extends string | number> = {
  value: T
  label: string
}

type Props<T extends string | number> = {
  value: T | null
  onChange: (value: T | null) => void
  options: SelectListboxOption<T>[]
  placeholder: string
  className?: string
}

export function SelectListbox<T extends string | number>({
  value,
  onChange,
  options,
  placeholder,
  className,
}: Props<T>) {
  const selectedOption = options.find((option) => option.value === value)

  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <div className={clsx("relative", className)}>
          <ListboxButton className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-3 pr-10 pl-4 text-left text-sm font-medium text-gray-900 shadow-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden">
            <span className="block truncate">{selectedOption?.label ?? placeholder}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
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
            <div className="absolute z-10 mt-1 w-full">
              <ListboxOptions
                static
                className="max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-gray-200/5 focus:outline-hidden sm:text-sm"
              >
              <ListboxOption
                value={null}
                className={({ active }) =>
                  clsx(
                    active ? "bg-blue-600 text-white" : "text-gray-900",
                    "relative cursor-default py-2 pr-9 pl-3 select-none",
                  )
                }
              >
                {({ selected, active }) => (
                  <>
                    <span
                      className={clsx(selected ? "font-semibold" : "font-normal", "block truncate")}
                    >
                      {placeholder}
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

              {options.map((option) => (
                <ListboxOption
                  key={option.value}
                  value={option.value}
                  className={({ active }) =>
                    clsx(
                      active ? "bg-blue-600 text-white" : "text-gray-900",
                      "relative cursor-default py-2 pr-9 pl-3 select-none",
                    )
                  }
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={clsx(
                          selected ? "font-semibold" : "font-normal",
                          "block truncate",
                        )}
                      >
                        {option.label}
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
            </div>
          </Transition>
        </div>
      )}
    </Listbox>
  )
}
