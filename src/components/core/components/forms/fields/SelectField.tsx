import type { JSX } from "react"
import { ComponentPropsWithoutRef, PropsWithoutRef } from "react"
import { twJoin } from "tailwind-merge"
import { FieldErrors } from "@/src/components/core/components/forms/FieldErrors"
import { useFieldContext } from "@/src/components/core/components/forms/hooks/formContext"
import { useFieldDisabled } from "@/src/components/core/components/forms/hooks/useFormHydrated"

export type SelectFieldProps = {
  label: string
  options: [string | number | "", string][]
  help?: string
  optional?: boolean
  disabled?: boolean
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  classLabelOverwrite?: string
  onChange?: (value: string) => void
} & Omit<PropsWithoutRef<JSX.IntrinsicElements["select"]>, "value" | "onChange" | "onBlur">

export function SelectField({
  label,
  options,
  help,
  optional,
  disabled,
  outerProps,
  labelProps,
  classLabelOverwrite,
  onChange,
  ...props
}: SelectFieldProps) {
  const field = useFieldContext<string | number | null>()
  const fieldDisabled = useFieldDisabled(disabled)
  const hasError = field.state.meta.errors.length > 0

  return (
    <div {...outerProps}>
      <label
        {...labelProps}
        htmlFor={field.name}
        className={classLabelOverwrite || "mb-1 block text-sm font-medium text-gray-700"}
      >
        {label}
        {optional && <> (optional)</>}
      </label>
      <select
        disabled={fieldDisabled}
        id={field.name}
        {...props}
        value={String(field.state.value ?? "")}
        onChange={(e) => {
          field.handleChange(e.target.value)
          onChange?.(e.target.value)
        }}
        onBlur={field.handleBlur}
        className={twJoin(
          "w-full rounded-md border border-gray-200 bg-white px-3 py-2 shadow-xs focus:outline-hidden sm:text-sm",
          hasError
            ? "border-red-800 shadow-red-200 focus:border-red-800 focus:ring-red-800"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
        )}
      >
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
      {Boolean(help) && <p className="mt-2 text-sm text-gray-500">{help}</p>}
      <FieldErrors errors={field.state.meta.errors} />
    </div>
  )
}
