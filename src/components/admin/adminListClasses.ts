import { clsx } from "clsx"
import {
  actionButtonBase,
  actionIconButtonClassName,
} from "@/src/components/core/components/buttons/actionButtonClasses"

export const adminTableWrapperClassName =
  "not-prose overflow-x-auto rounded-md border border-gray-200 bg-white"

/** Caps table body copy at text-sm; use {@link adminTableCellSubtextClassName} for secondary lines. */
export const adminTableClassName = "min-w-full divide-y divide-gray-200 text-sm text-gray-700"

export const adminTableHeaderClassName = "px-4 py-3 text-left font-semibold text-gray-700"

export const adminTableHeaderRightClassName = "px-4 py-3 text-right font-semibold text-gray-700"

export const adminTableCellClassName = "px-4 py-3"

export const adminTableCellRightClassName = "px-4 py-3 text-right"

/** Secondary line inside a table cell (slug, hint, relative time). Never larger than the table base. */
export const adminTableCellSubtextClassName = "text-xs text-gray-500"

/** Text link in admin tables that opens in a new tab. */
export const adminTableExternalLinkClassName =
  "inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800"

/** Compact primary action for admin table rows (smaller than header actions). */
export const adminTableEditButtonClassName = clsx(
  actionButtonBase,
  "min-h-8 gap-x-1.5 bg-blue-500 px-2.5 py-1 text-sm/4 leading-tight text-white hover:bg-blue-800 hover:!text-white active:ring-2 active:ring-blue-800",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 disabled:shadow-none disabled:ring-1 disabled:ring-gray-200 disabled:hover:bg-gray-100 disabled:hover:!text-gray-500 disabled:active:ring-0 disabled:[&_svg]:text-gray-400",
)

/** Leading icon inside {@link adminTableEditButtonClassName} actions. */
export const adminTablePrimaryButtonIconClassName = "-ml-0.5 shrink-0 [&_svg]:size-4"

/** Icon-only destructive action for admin table rows. */
export const adminTableDeleteButtonClassName = clsx(
  actionButtonBase,
  "size-8 shrink-0 text-gray-600 ring-1 ring-gray-300 hover:bg-red-50 hover:text-red-700 hover:ring-red-200 disabled:cursor-not-allowed disabled:opacity-50",
)

export const adminTableActionsClassName = "flex items-center justify-end gap-2"

/** Toggle/control groups in data columns (left-aligned). */
export const adminTableControlsClassName = "flex items-center justify-start gap-2"

/** Neutral icon control for admin table rows (links and inactive toggles). */
export const adminTableIconButtonClassName = actionIconButtonClassName
