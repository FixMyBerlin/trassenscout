import {
  Combobox,
  ComboboxButton,
  ComboboxOption,
  ComboboxOptions,
  Label,
  Transition,
} from "@headlessui/react"
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid"
import { Fragment, useState } from "react"
import { FieldError } from "react-hook-form"

export default function ComboBoxWrapper({
  value = "",
  onChange,
  onBlur,
  label,
  options,
  error,
}: {
  value: string | number
  onChange: any
  onBlur: any
  label: string
  options: {
    value: string | number
    label: string
    id: number | string
  }[]
  error: FieldError | undefined
}) {
  const [query, setQuery] = useState("")

  const filteredOptions =
    query === ""
      ? options
      : options.filter((option) => {
          return option.label.toLowerCase().includes(query.toLowerCase())
        })

  const getNameFromValue = (value: string | number) => {
    const option = options.find((option) => option.value === value)
    return option ? option.label : ""
  }

  return (
    <>
      <Combobox value={value} onChange={onChange}>
        <Label className="mt-6 block text-sm font-medium leading-6 text-gray-900">{label}</Label>
        <div className="relative mt-3">
          <div className="focus-visible:ring-offset-orange-300 relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 sm:text-sm">
            <ComboboxButton className="inset-y-0 right-0 flex w-full items-center pr-2">
              <Combobox.Input
                className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                onChange={(event) => setQuery(event.target.value)}
                displayValue={(optionValue: string | number) => getNameFromValue(optionValue)}
                placeholder="Start typing to search..."
                onBlur={onBlur}
              />
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </ComboboxButton>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <ComboboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredOptions.length === 0 && query !== "" ? (
                <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <ComboboxOption
                    key={option.id}
                    className={({ active }) =>
                      `relative cursor-default py-2 pl-10 pr-4 ${
                        active ? "bg-orange-600 text-white" : "text-gray-900"
                      }`
                    }
                    value={option.value}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                        >
                          {option.label}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? "text-white" : "text-orange-600"
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </ComboboxOption>
                ))
              )}
            </ComboboxOptions>
          </Transition>
        </div>
      </Combobox>
      {error && (
        <p className="mt-2 text-sm text-red-600" id="email-error">
          {error.message}
        </p>
      )}
    </>
  )
}
