import { clsx } from "clsx"
import type { JSX } from "react"
import { ComponentPropsWithoutRef, PropsWithoutRef } from "react"
import { FieldErrors } from "@/src/components/core/components/forms/FieldErrors"
import { useFieldContext } from "@/src/components/core/components/forms/hooks/formContext"
import { useFieldDisabled } from "@/src/components/core/components/forms/hooks/useFormHydrated"

export type RadiobuttonProps = {
  value: string
  label: string | React.ReactNode
  help?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  readonly?: boolean
  disabled?: boolean
  onValueChange?: (value: string) => void
  onChange?: PropsWithoutRef<JSX.IntrinsicElements["input"]>["onChange"]
} & Omit<
  PropsWithoutRef<JSX.IntrinsicElements["input"]>,
  "type" | "checked" | "value" | "onChange" | "onBlur"
>

export function Radiobutton({
  value,
  label,
  help,
  outerProps,
  labelProps,
  readonly,
  disabled,
  onValueChange,
  onChange,
  ...props
}: RadiobuttonProps) {
  const field = useFieldContext<string>()
  const fieldDisabled = useFieldDisabled(disabled)
  const hasError = field.state.meta.errors.length > 0
  const id = `${field.name}-${value}`

  return (
    <div
      {...outerProps}
      className={clsx(outerProps?.className, "flex break-inside-avoid items-center justify-start")}
    >
      <div className="flex h-5 items-center">
        <input
          type="radio"
          disabled={fieldDisabled}
          readOnly={readonly}
          checked={field.state.value === value}
          id={id}
          {...props}
          onChange={(e) => {
            field.handleChange(value)
            onValueChange?.(value)
            onChange?.(e)
          }}
          onBlur={field.handleBlur}
          className={clsx(
            "size-4 cursor-pointer",
            hasError
              ? "border-red-800 text-red-500 shadow-xs shadow-red-200 focus:ring-red-800"
              : readonly || disabled
                ? "border-gray-200 bg-gray-100 checked:bg-gray-500"
                : "border-gray-300 text-blue-600 focus:ring-blue-500",
          )}
        />
      </div>
      <label
        {...labelProps}
        htmlFor={id}
        className={clsx(
          "block pl-3 text-sm font-medium whitespace-nowrap",
          readonly || disabled
            ? "text-gray-400"
            : "cursor-pointer text-gray-700 hover:text-gray-900",
        )}
      >
        {label}
        {help && <div className="m-0 text-gray-500">{help}</div>}
        <FieldErrors errors={field.state.meta.errors} />
      </label>
    </div>
  )
}
