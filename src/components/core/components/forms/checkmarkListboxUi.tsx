import { CheckIcon } from "@heroicons/react/20/solid"
import type { ReactNode } from "react"
import { twJoin } from "tailwind-merge"

/** Dropdown panel for listbox/combobox options with left-aligned checkmarks. */
export const checkmarkListboxOptionsPanelClassName =
  "max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg outline-1 outline-black/5 focus:outline-hidden sm:text-sm"

/** Single option row — use as `className` on Headless UI `ListboxOption` / `ComboboxOption`. */
export const checkmarkListboxOptionClassName =
  "group relative cursor-pointer py-2 pr-4 pl-8 text-gray-900 select-none data-disabled:cursor-not-allowed data-focus:bg-blue-600 data-focus:text-white data-focus:outline-hidden"

/** Label + left checkmark children for {@link checkmarkListboxOptionClassName} options. */
export function CheckmarkListboxOptionLabel({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="block truncate font-normal group-data-selected:font-semibold">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 group-data-disabled:hidden group-data-focus:text-white/50 group-data-focus:opacity-100 group-data-selected:hidden"
      >
        <CheckIcon className="size-5" />
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-blue-600 group-not-data-selected:hidden group-data-focus:text-white"
      >
        <CheckIcon className="size-5" />
      </span>
    </>
  )
}

/** Legacy option row with right-aligned checkmark. */
export const classicListboxOptionClassName =
  "group relative cursor-pointer py-2 pr-9 pl-3 text-gray-900 select-none data-disabled:cursor-not-allowed data-focus:bg-blue-600 data-focus:text-white"

/** Label + right checkmark children for {@link classicListboxOptionClassName} options. */
export function ClassicListboxOptionLabel({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="block truncate group-data-selected:font-semibold">{children}</span>
      <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600 group-data-focus:text-white">
        <CheckIcon className="invisible size-5 group-data-selected:visible" aria-hidden="true" />
      </span>
    </>
  )
}

export type ListboxOptionUi = "checkmark" | "classic"

export function listboxOptionClassName(ui: ListboxOptionUi, extra?: string) {
  return twJoin(
    ui === "checkmark" ? checkmarkListboxOptionClassName : classicListboxOptionClassName,
    extra,
  )
}

export function ListboxOptionLabel({ ui, children }: { ui: ListboxOptionUi; children: ReactNode }) {
  return ui === "checkmark" ? (
    <CheckmarkListboxOptionLabel>{children}</CheckmarkListboxOptionLabel>
  ) : (
    <ClassicListboxOptionLabel>{children}</ClassicListboxOptionLabel>
  )
}
