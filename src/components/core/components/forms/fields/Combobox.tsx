import {
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Combobox as HeadlessCombobox,
  Transition,
} from "@headlessui/react"
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/20/solid"
import { Fragment, type ReactNode, useRef, useState } from "react"
import { twJoin, twMerge } from "tailwind-merge"
import {
  checkmarkListboxOptionsPanelClassName,
  type ListboxOptionUi,
  listboxOptionClassName,
  ListboxOptionLabel,
} from "@/src/components/core/components/forms/checkmarkListboxUi"
import { FieldErrors } from "@/src/components/core/components/forms/FieldErrors"
import { FieldLayout } from "@/src/components/core/components/forms/FieldLayout"
import { useFieldContext } from "@/src/components/core/components/forms/hooks/formContext"
import { useFieldDisabled } from "@/src/components/core/components/forms/hooks/useFormHydrated"
import { linkStyles } from "@/src/components/core/components/links/styles"

type ComboboxItem = {
  value: string
  label: string | ReactNode
  /** Text for search and duplicate check when it differs from the label. */
  searchText?: string
  chipClassName?: string
  disabled?: boolean
}

function itemLabelText(item: ComboboxItem) {
  return typeof item.label === "string" ? item.label : undefined
}

function itemSearchText(item: ComboboxItem) {
  return item.searchText ?? String(item.label)
}

const CREATE_OPTION = "__create__"

export type ComboboxProps = {
  label?: string
  help?: string
  optional?: boolean
  disabled?: boolean
  items: ComboboxItem[]
  placeholder?: string
  classLabelOverwrite?: string
  trailingControl?: ReactNode
  /** Dropdown option layout. Defaults to left checkmarks. */
  optionUi?: ListboxOptionUi
  chips?: boolean
  onCreate?: (title: string) => Promise<void> | void
}

export function Combobox({
  label,
  help,
  optional,
  disabled,
  items,
  placeholder,
  classLabelOverwrite,
  trailingControl,
  optionUi = "checkmark",
  chips = false,
  onCreate,
}: ComboboxProps) {
  const field = useFieldContext<string[]>()
  const fieldDisabled = useFieldDisabled(disabled)
  const [query, setQuery] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const creatingRef = useRef(false)
  const [pinnedSelected, setPinnedSelected] = useState<string[]>(() => {
    const initial = field.form.getFieldValue(field.name)
    return Array.isArray(initial) ? initial.filter((v): v is string => typeof v === "string") : []
  })

  const hasError = field.state.meta.errors.length > 0
  const value = Array.isArray(field.state.value)
    ? field.state.value.filter((v): v is string => typeof v === "string")
    : []
  const disabledOrEmpty = Boolean(fieldDisabled || (items.length === 0 && !onCreate))

  const pinned = new Set(pinnedSelected)
  const orderedItems = chips
    ? items
    : [...items].sort((a, b) => Number(pinned.has(b.value)) - Number(pinned.has(a.value)))
  const filteredItems =
    query === ""
      ? orderedItems
      : orderedItems.filter((i) => itemSearchText(i).toLowerCase().includes(query.toLowerCase()))

  const selected = value
    .map((selectedValue) => items.find((item) => item.value === selectedValue))
    .filter((item): item is ComboboxItem => typeof item?.label === "string" && item.label !== "")
  const selectedLabels = selected.map((item) => item.label as string)

  const createTitle = query.trim()
  const showCreateOption =
    Boolean(onCreate) &&
    createTitle !== "" &&
    !items.some(
      (item) =>
        itemSearchText(item).toLocaleLowerCase("de") === createTitle.toLocaleLowerCase("de"),
    )

  const handleCreate = async (title: string) => {
    if (!onCreate || creatingRef.current) return
    creatingRef.current = true
    setIsCreating(true)
    setCreateError(null)
    try {
      await onCreate(title)
      setQuery("")
    } catch (error) {
      console.error(error)
      setCreateError(`„${title}“ konnte nicht erstellt werden. Bitte erneut versuchen.`)
    } finally {
      creatingRef.current = false
      setIsCreating(false)
    }
  }

  const inputPlaceholder =
    items.length === 0 && !onCreate
      ? label
        ? `keine ${label} zur Auswahl`
        : "keine Einträge zur Auswahl"
      : (placeholder ?? (label ? `${label} suchen` : "Suchen"))

  const control = (
    <>
      {chips && selected.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1">
          {selected.map((item) => (
            <li
              key={item.value}
              className={twMerge(
                "inline-flex items-center gap-1 rounded-sm border border-transparent bg-gray-100 py-1 pr-1 pl-2 text-xs text-gray-700",
                item.chipClassName,
              )}
            >
              {item.label}
              <button
                type="button"
                aria-label={`${item.label} entfernen`}
                className="cursor-pointer rounded-sm text-gray-500 hover:bg-gray-200 hover:text-gray-800"
                onClick={() => field.handleChange(value.filter((v) => v !== item.value))}
              >
                <XMarkIcon className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {!chips && value.length > 0 && (
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex size-4.5 shrink-0 items-center justify-center rounded-full bg-gray-400 p-1 text-xs font-bold text-white">
            {value.length}
          </span>
          {selectedLabels.length > 0 && (
            <p
              className="min-w-0 flex-1 truncate text-xs text-gray-700"
              title={selectedLabels.join(", ")}
            >
              {selectedLabels.join(", ")}
            </p>
          )}
          <button
            type="button"
            className={twJoin(
              linkStyles,
              "flex shrink-0 cursor-pointer items-center gap-1 text-sm",
            )}
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

      <HeadlessCombobox
        immediate
        multiple
        value={value}
        onChange={(next) => {
          if (next.includes(CREATE_OPTION)) {
            void handleCreate(createTitle)
            return
          }
          field.handleChange(next)
          // Chips: the next search starts from an empty field.
          if (chips) setQuery("")
        }}
        onClose={() => {
          setQuery("")
          setPinnedSelected(value)
        }}
        disabled={disabledOrEmpty}
        invalid={hasError}
      >
        {({ open }) => (
          <div className="relative w-full">
            <ComboboxInput
              id={field.name}
              autoComplete="off"
              value={query}
              onBlur={field.handleBlur}
              placeholder={inputPlaceholder}
              onChange={(e) => {
                setQuery(e.target.value)
                setCreateError(null)
              }}
              className={twJoin(
                "block w-full appearance-none rounded-md border border-gray-200 px-3 py-2 pr-10 placeholder-gray-400 shadow-xs focus:outline-hidden sm:text-sm",
                hasError
                  ? "border-red-800 shadow-red-200 focus:border-red-800 focus:ring-red-800"
                  : disabledOrEmpty
                    ? "bg-gray-50 text-gray-500 ring-gray-200"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
              )}
              disabled={disabledOrEmpty}
            />
            <ComboboxButton className="absolute inset-y-0 right-3 my-auto flex cursor-pointer items-center text-gray-400 disabled:cursor-not-allowed">
              <ChevronDownIcon className="size-5" aria-hidden="true" />
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
                  className={twJoin(
                    checkmarkListboxOptionsPanelClassName,
                    "w-full empty:invisible",
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
                      <ListboxOptionLabel ui={optionUi} title={itemLabelText(item)}>
                        {item.label}
                      </ListboxOptionLabel>
                    </ComboboxOption>
                  ))}
                  {showCreateOption && (
                    <ComboboxOption
                      value={CREATE_OPTION}
                      disabled={isCreating}
                      className={listboxOptionClassName(optionUi, "data-disabled:opacity-50")}
                    >
                      <ListboxOptionLabel ui={optionUi}>
                        „{createTitle}“ {isCreating ? "wird erstellt…" : "erstellen"}
                      </ListboxOptionLabel>
                    </ComboboxOption>
                  )}
                </ComboboxOptions>
              </div>
            </Transition>
          </div>
        )}
      </HeadlessCombobox>
      {createError && (
        <p role="alert" className="mt-1 text-sm text-red-800">
          {createError}
        </p>
      )}
    </>
  )

  const controlWithTrailing = trailingControl ? (
    <div className="flex w-full min-w-0 flex-col gap-2">
      {control}
      {trailingControl}
    </div>
  ) : (
    control
  )

  if (!label) {
    return (
      <div>
        {controlWithTrailing}
        {Boolean(help) && <p className="mt-2 text-sm text-gray-500">{help}</p>}
        <FieldErrors errors={field.state.meta.errors} />
      </div>
    )
  }

  return (
    <FieldLayout
      label={label}
      optional={optional}
      htmlFor={field.name}
      help={help}
      errors={field.state.meta.errors}
      classLabelOverwrite={classLabelOverwrite}
    >
      {controlWithTrailing}
    </FieldLayout>
  )
}
