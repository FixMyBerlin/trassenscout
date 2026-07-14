import {
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Combobox as HeadlessCombobox,
  Transition,
} from "@headlessui/react"
import { ChevronDownIcon } from "@heroicons/react/20/solid"
import { Fragment, type ReactNode, useState } from "react"
import { twJoin } from "tailwind-merge"
import {
  checkmarkListboxOptionsPanelClassName,
  type ListboxOptionUi,
  listboxOptionClassName,
  ListboxOptionLabel,
} from "@/src/components/core/components/forms/checkmarkListboxUi"

export type ComboboxSingleItem = {
  value: string
  label: string | ReactNode
  /** Search text when label is a ReactNode. Required for ReactNode labels. */
  searchText?: string
  disabled?: boolean
}

export type ComboboxSingleBaseProps = {
  value: string | null
  onChange: (value: string | null) => void
  items: ComboboxSingleItem[]
  /** Placeholder for the search field inside the dropdown. */
  placeholder?: string
  disabled?: boolean
  /** Custom trigger button styling. Defaults to form-field select styling. */
  classNameButton?: string
  /** Dropdown panel width. Defaults to full trigger width. */
  classNameDropdown?: string
  optionUi?: ListboxOptionUi
  invalid?: boolean
  id?: string
  onBlur?: () => void
  /** Screen-reader label for the trigger button. */
  buttonSrLabel?: string
}

function itemSearchText(item: ComboboxSingleItem) {
  return item.searchText ?? String(item.label)
}

function selectedTriggerText(item: ComboboxSingleItem) {
  return item.searchText ?? (typeof item.label === "string" ? item.label : String(item.label))
}

export function ComboboxSingleBase({
  value,
  onChange,
  items,
  placeholder,
  disabled,
  classNameButton,
  classNameDropdown = "w-full min-w-full",
  optionUi = "checkmark",
  invalid,
  id,
  onBlur,
  buttonSrLabel,
}: ComboboxSingleBaseProps) {
  const [query, setQuery] = useState("")
  const disabledOrEmpty = Boolean(disabled || items.length === 0)
  const selectedItem = items.find((item) => item.value === value) ?? null

  const filteredItems =
    query === ""
      ? items
      : items.filter((item) => itemSearchText(item).toLowerCase().includes(query.toLowerCase()))

  const triggerClassName =
    classNameButton ??
    twJoin(
      "flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border px-3 py-2 text-left shadow-xs focus:outline-hidden sm:text-sm",
      invalid
        ? "border-red-800 shadow-red-200 focus:border-red-800 focus:ring-red-800"
        : disabledOrEmpty
          ? "cursor-not-allowed bg-gray-50 text-gray-500 ring-gray-200"
          : "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500",
    )

  return (
    <HeadlessCombobox
      immediate
      value={value}
      onChange={onChange}
      onClose={() => setQuery("")}
      disabled={disabledOrEmpty}
      invalid={invalid}
    >
      {({ open }) => (
        <div className="relative">
          <ComboboxButton id={id} onBlur={onBlur} className={triggerClassName}>
            {buttonSrLabel && <span className="sr-only">{buttonSrLabel}</span>}
            <span className="truncate">
              {selectedItem ? selectedTriggerText(selectedItem) : "Auswählen"}
            </span>
            <ChevronDownIcon className="size-5 shrink-0 text-gray-400" aria-hidden="true" />
          </ComboboxButton>

          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className={twJoin("absolute z-10 mt-1", classNameDropdown)}>
              <div className="rounded-md bg-white shadow-lg ring-1 ring-black/5">
                <div className="p-1.5">
                  <ComboboxInput
                    autoFocus
                    autoComplete="off"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={placeholder ?? "Suchen"}
                    className="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-base placeholder-gray-400 focus:border-blue-500 focus:outline-hidden sm:text-sm"
                  />
                </div>
                <ComboboxOptions
                  static
                  className={twJoin(
                    checkmarkListboxOptionsPanelClassName,
                    "max-h-[50vh] w-full empty:invisible",
                    optionUi === "classic" ? "border border-gray-300" : "",
                  )}
                >
                  {filteredItems.map((item) => (
                    <ComboboxOption
                      key={item.value}
                      value={item.value}
                      disabled={item.disabled}
                      className={listboxOptionClassName(optionUi, "data-disabled:opacity-50")}
                    >
                      <ListboxOptionLabel ui={optionUi}>{item.label}</ListboxOptionLabel>
                    </ComboboxOption>
                  ))}
                </ComboboxOptions>
              </div>
            </div>
          </Transition>
        </div>
      )}
    </HeadlessCombobox>
  )
}
