import { twJoin } from "tailwind-merge"

/** Base `<table>` styling: typography, collapse, row separators via tbody/tr classes. */
export const tableClassName = "min-w-full border-collapse text-left text-sm text-gray-700"

/** Use with `@container` tables that define column widths via `<colgroup>`. */
export const tableFixedClassName = twJoin(tableClassName, "table-fixed")

export const tableHeadRowClassName = "border-b border-gray-200 bg-gray-50"

export const tableHeadCellClassName = "px-3 pt-3 pb-2 font-medium uppercase"

export const tableHeadCellRightClassName = twJoin(tableHeadCellClassName, "text-right")

export const tableBodyClassName = "divide-y divide-gray-200 bg-white"

export const tableRowClassName = "border-b border-gray-100"

export const tableCellClassName = "px-3 py-2"
