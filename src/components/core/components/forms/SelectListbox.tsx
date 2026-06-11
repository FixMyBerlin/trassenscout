import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react"
import { ChevronDownIcon } from "@heroicons/react/20/solid"
import { Fragment } from "react"
import { twJoin } from "tailwind-merge"
import {
  checkmarkListboxOptionClassName,
  checkmarkListboxOptionsPanelClassName,
  CheckmarkListboxOptionLabel,
} from "@/src/components/core/components/forms/checkmarkListboxUi"

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
        <div className={twJoin("relative", className)}>
          <ListboxButton className="relative w-full cursor-default rounded-md border border-gray-300 bg-white px-3 py-2.5 pr-10 text-left text-sm font-medium text-gray-900 shadow-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden focus:ring-inset">
            <span className="block truncate">{selectedOption?.label ?? placeholder}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
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
            <div className="absolute z-10 mt-1 w-full">
              <ListboxOptions static className={checkmarkListboxOptionsPanelClassName}>
                <ListboxOption value={null} className={checkmarkListboxOptionClassName}>
                  <CheckmarkListboxOptionLabel>{placeholder}</CheckmarkListboxOptionLabel>
                </ListboxOption>

                {options.map((option) => (
                  <ListboxOption
                    key={option.value}
                    value={option.value}
                    className={checkmarkListboxOptionClassName}
                  >
                    <CheckmarkListboxOptionLabel>{option.label}</CheckmarkListboxOptionLabel>
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
