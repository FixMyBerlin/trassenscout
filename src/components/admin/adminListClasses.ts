import { twJoin } from "tailwind-merge"
import { actionButtonBase } from "@/src/components/core/components/buttons/actionButtonClasses"
import {
  tableBodyClassName,
  tableCellClassName,
  tableClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"

/** Aligns with frontend `tableClassName` (border-collapse, no uppercase headers). */
export const adminTableClassName = tableClassName

/** Gray header row — same as frontend `tableHeadRowClassName`. */
export const adminTableHeadRowClassName = tableHeadRowClassName

/**
 * Header cell: same metrics as frontend `tableHeadCellClassName`, but sentence case (no uppercase).
 */
export const adminTableHeaderClassName = "px-3 pt-3 pb-2 text-left font-medium text-gray-700"

export const adminTableHeaderRightClassName = twJoin(adminTableHeaderClassName, "text-right")

/** White body with row dividers — same as frontend `tableBodyClassName`. */
export const adminTableBodyClassName = tableBodyClassName

export const adminTableRowClassName = tableRowClassName

export const adminTableCellClassName = tableCellClassName

export const adminTableCellRightClassName = twJoin(adminTableCellClassName, "text-right")

/** Secondary line inside a table cell (slug, hint, relative time). Never larger than the table base. */
export const adminTableCellSubtextClassName = "text-xs text-gray-500"

/** Text link in admin tables that opens in a new tab. */
export const adminTableExternalLinkClassName =
  "inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800"

/** Compact primary action for admin table rows (smaller than header actions). */
export const adminTableEditButtonClassName = twJoin(
  actionButtonBase,
  "min-h-8 gap-x-1.5 bg-blue-500 px-2.5 py-1 text-sm/4 leading-tight text-white hover:bg-blue-800 hover:!text-white active:ring-2 active:ring-blue-800",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 disabled:shadow-none disabled:ring-1 disabled:ring-gray-200 disabled:hover:bg-gray-100 disabled:hover:!text-gray-500 disabled:active:ring-0 disabled:[&_svg]:text-gray-400",
)

/** Leading icon inside {@link adminTableEditButtonClassName} actions. */
export const adminTablePrimaryButtonIconClassName = "-ml-0.5 shrink-0 [&_svg]:size-4"

/** Icon-only destructive action for admin table rows. */
export const adminTableDeleteButtonClassName = twJoin(
  actionButtonBase,
  "size-8 shrink-0 text-gray-600 ring-1 ring-gray-300 hover:bg-red-50 hover:text-red-700 hover:ring-red-200 disabled:cursor-not-allowed disabled:opacity-50",
)

export const adminTableActionsClassName = "flex items-center justify-end gap-2"
