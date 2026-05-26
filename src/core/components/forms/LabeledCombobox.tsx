import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Transition,
} from "@headlessui/react"
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid"
import { ErrorMessage } from "@hookform/error-message"
import { clsx } from "clsx"
import { Fragment, type ReactNode, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"

export type LabeledComboboxItem = {
  value: string
  label: string | ReactNode
  disabled?: boolean
}

export type LabeledComboboxProps = {
  /** RHF field name; value stored as `string[]`. */
  scope: string
  label?: string
  help?: string
  optional?: boolean
  disabled?: boolean
  items: LabeledComboboxItem[]
  placeholder?: string
  classLabelOverwrite?: string
}

export function LabeledCombobox({
  scope,
  label,
  help,
  optional,
  disabled,
  items,
  placeholder,
  classLabelOverwrite,
}: LabeledComboboxProps) {
  const [query, setQuery] = useState("")
  const {
    control,
    getValues,
    formState: { isSubmitting, errors },
  } = useFormContext()

  const hasError = Boolean(errors[scope])
  const disabledOrSubmitting = Boolean(disabled || isSubmitting)

  const selectedItems = getValues(scope)

  return (
    <div>
      {Boolean(label) && (
        <label
          htmlFor={scope}
          className={classLabelOverwrite || "mb-1 block text-sm font-medium text-gray-700"}
        >
          {label}
          {optional && <> (optional)</>}
          {selectedItems?.length > 0 && (
            <span className="ml-1 inline-flex size-4.5 items-center justify-center rounded-full bg-gray-300 text-xs text-white">
              {selectedItems.length}
            </span>
          )}
        </label>
      )}

      {Boolean(help) && <p className="mb-2 text-sm text-gray-500">{help}</p>}

      <Controller
        name={scope}
        control={control}
        render={({ field }) => {
          const value = (field.value as string[] | undefined) ?? []

          const filteredItems =
            query === ""
              ? items
              : items.filter((i) => String(i.label).toLowerCase().includes(query.toLowerCase()))

          return (
            <Combobox
              multiple
              value={value}
              onChange={field.onChange}
              onClose={() => setQuery("")}
              disabled={disabledOrSubmitting}
              invalid={hasError}
            >
              {({ open }) => (
                <div className="relative">
                  <ComboboxInput
                    ref={field.ref}
                    id={scope}
                    autoComplete="off"
                    value={query}
                    onBlur={field.onBlur}
                    placeholder={placeholder ?? `${label} suchen`}
                    onChange={(e) => setQuery(e.target.value)}
                    className={clsx(
                      "block w-full appearance-none rounded-md border border-gray-200 px-3 py-2 pr-10 placeholder-gray-400 shadow-xs focus:outline-hidden sm:text-sm",
                      hasError
                        ? "border-red-800 shadow-red-200 focus:border-red-800 focus:ring-red-800"
                        : disabledOrSubmitting
                          ? "bg-gray-50 text-gray-500 ring-gray-200"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                    )}
                    disabled={disabledOrSubmitting}
                  />
                  <ComboboxButton
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    disabled={disabledOrSubmitting}
                  >
                    <ChevronDownIcon
                      className="size-5 cursor-pointer text-gray-400"
                      aria-hidden="true"
                    />
                  </ComboboxButton>

                  <Transition
                    show={open}
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute z-10 mt-1 w-full">
                      <ComboboxOptions
                        static
                        className="max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white py-1 text-base shadow-lg empty:invisible focus:outline-hidden sm:text-sm"
                      >
                        {filteredItems.map((item) => (
                          <ComboboxOption
                            key={item.value}
                            value={item.value}
                            disabled={item.disabled}
                            className="group relative cursor-default py-2 pr-9 pl-3 text-gray-900 select-none data-disabled:opacity-50 data-focus:bg-blue-600 data-focus:text-white"
                          >
                            <span className="block truncate group-data-selected:font-semibold">
                              {item.label}
                            </span>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600 group-data-focus:text-white">
                              <CheckIcon
                                className="invisible size-5 group-data-selected:visible"
                                aria-hidden="true"
                              />
                            </span>
                          </ComboboxOption>
                        ))}
                      </ComboboxOptions>
                    </div>
                  </Transition>
                </div>
              )}
            </Combobox>
          )
        }}
      />

      <ErrorMessage
        render={({ message }) => (
          <div role="alert" className="mt-1 text-sm text-red-800">
            {message}
          </div>
        )}
        errors={errors}
        name={scope}
      />
    </div>
  )
}
