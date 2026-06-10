import { clsx } from "clsx"

export const checkboxRowClassName = "flex break-inside-avoid items-start"

export function checkboxInputClassName({
  hasError,
  readonly,
  disabled,
}: {
  hasError: boolean
  readonly?: boolean
  disabled?: boolean
}) {
  return clsx(
    "size-4 cursor-pointer rounded",
    hasError
      ? "border-red-800 text-red-500 shadow-xs shadow-red-200 focus:ring-red-800"
      : readonly || disabled
        ? "border-gray-200 bg-gray-100 checked:bg-gray-500"
        : "border-gray-300 text-blue-600 focus:ring-blue-500",
  )
}

export function checkboxLabelClassName({
  readonly,
  disabled,
}: {
  readonly?: boolean
  disabled?: boolean
}) {
  return clsx(
    "block pl-3 text-sm font-medium",
    readonly || disabled ? "text-gray-400" : "cursor-pointer text-gray-700 hover:text-gray-900",
  )
}
