"use client"

import { FieldErrors } from "@/src/core/components/forms/FieldErrors"
import { useFieldContext } from "@/src/core/components/forms/hooks/formContext"
import { linkStyles } from "@/src/core/components/links"
import {
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Combobox as HeadlessCombobox,
  Transition,
} from "@headlessui/react"
import { CheckIcon, ChevronDownIcon, XMarkIcon } from "@heroicons/react/20/solid"
import { clsx } from "clsx"
import { Fragment, type ReactNode, useState } from "react"

export type ComboboxItem = {
  value: string
  label: string | ReactNode
  disabled?: boolean
}

export type ComboboxProps = {
  label?: string
  help?: string
  optional?: boolean
  disabled?: boolean
  items: ComboboxItem[]
  placeholder?: string
  classLabelOverwrite?: string
}

export function Combobox({
  label,
  help,
  optional,
  disabled,
  items,
  placeholder,
  classLabelOverwrite,
}: ComboboxProps) {
  const field = useFieldContext<string[]>()
  const [query, setQuery] = useState("")
  const [pinnedSelected, setPinnedSelected] = useState<string[]>(() => {
    const initial = field.form.getFieldValue(field.name)
    return Array.isArray(initial) ? initial.filter((v): v is string => typeof v === "string") : []
  })

  const hasError = field.state.meta.errors.length > 0
  const value = Array.isArray(field.state.value)
    ? field.state.value.filter((v): v is string => typeof v === "string")
    : []
  const disabledOrEmpty = Boolean(disabled || items.length === 0)

  const pinned = new Set(pinnedSelected)
  const orderedItems = [...items].sort(
    (a, b) => Number(pinned.has(b.value)) - Number(pinned.has(a.value)),
  )
  const filteredItems =
    query === ""
      ? orderedItems
      : orderedItems.filter((i) => String(i.label).toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      <div className="flex items-center gap-1">
        {Boolean(label) && (
          <label
            htmlFor={field.name}
            className={classLabelOverwrite || "mb-1 block text-sm font-medium text-gray-700"}
          >
            {label}
            {optional && <> (optional)</>}
          </label>
        )}
        {value.length > 0 && (
          <div className="flex grow items-center justify-between gap-1">
            <span className="inline-flex size-4.5 shrink-0 items-center justify-center rounded-full bg-gray-400 p-1 text-xs font-bold text-white">
              {value.length}
            </span>
            <button
              type="button"
              className={clsx(linkStyles, "flex cursor-pointer items-center gap-1 text-sm")}
              onClick={() => {
                field.handleChange([])
                setQuery("")
              }}
            >
              <XMarkIcon className="size-4" />
              <span>Auswahl zurücksetzen</span>
            </button>
          </div>
        )}
      </div>

      {Boolean(help) && <p className="mb-2 text-sm text-gray-500">{help}</p>}

      <HeadlessCombobox
        immediate
        multiple
        value={value}
        onChange={(next) => field.handleChange(next)}
        onClose={() => {
          setQuery("")
          setPinnedSelected(value)
        }}
        disabled={disabledOrEmpty}
        invalid={hasError}
      >
        {({ open }) => (
          <div className="relative">
            <ComboboxInput
              id={field.name}
              autoComplete="off"
              value={query}
              onBlur={field.handleBlur}
              placeholder={
                items.length === 0
                  ? `keine ${label} zur Auswahl`
                  : (placeholder ?? `${label} suchen`)
              }
              onChange={(e) => setQuery(e.target.value)}
              className={clsx(
                "block w-full appearance-none rounded-md border border-gray-200 px-3 py-2 pr-10 placeholder-gray-400 shadow-xs focus:outline-hidden sm:text-sm",
                hasError
                  ? "border-red-800 shadow-red-200 focus:border-red-800 focus:ring-red-800"
                  : disabledOrEmpty
                    ? "bg-gray-50 text-gray-500 ring-gray-200"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
              )}
              disabled={disabledOrEmpty}
            />
            <ChevronDownIcon
              className="pointer-events-none absolute inset-y-0 right-3 my-auto size-5 text-gray-400"
              aria-hidden="true"
            />

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
      </HeadlessCombobox>

      <FieldErrors errors={field.state.meta.errors} />
    </div>
  )
}
