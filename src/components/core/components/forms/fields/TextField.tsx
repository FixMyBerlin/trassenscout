import type { JSX } from "react"
import { ComponentPropsWithoutRef, PropsWithoutRef, ReactNode } from "react"
import { twJoin } from "tailwind-merge"
import { FieldLayout } from "@/src/components/core/components/forms/FieldLayout"
import { useFieldContext } from "@/src/components/core/components/forms/hooks/formContext"
import { useFieldDisabled } from "@/src/components/core/components/forms/hooks/useFormHydrated"

export type TextFieldProps = {
  label: string
  help?: string
  optional?: boolean
  disabled?: boolean
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  inlineLeadingAddon?: string
  trailingControl?: ReactNode
} & Omit<PropsWithoutRef<JSX.IntrinsicElements["input"]>, "value" | "onChange" | "onBlur">

export function TextField({
  label,
  help,
  optional,
  disabled,
  outerProps,
  labelProps,
  inlineLeadingAddon,
  trailingControl,
  onKeyDown,
  ...props
}: TextFieldProps) {
  const field = useFieldContext<string>()
  const fieldDisabled = useFieldDisabled(disabled)
  const hasError = field.state.meta.errors.length > 0

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (props.type === "number" && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault()
    }
    onKeyDown?.(e)
  }

  const input = (
    <div className="relative grow">
      {inlineLeadingAddon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-gray-500 sm:text-sm">{inlineLeadingAddon}</span>
        </div>
      )}
      <input
        disabled={fieldDisabled}
        id={field.name}
        {...props}
        value={String(field.state.value ?? "")}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        onKeyDown={handleKeyDown}
        className={twJoin(
          inlineLeadingAddon ? "pl-12" : "",
          "block w-full appearance-none rounded-md border border-gray-200 px-3 py-2 placeholder-gray-400 shadow-xs focus:outline-hidden sm:text-sm",
          hasError
            ? "border-red-800 shadow-red-200 focus:border-red-800 focus:ring-red-800"
            : props.readOnly || fieldDisabled
              ? "bg-gray-50 text-gray-500 ring-gray-200"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
        )}
      />
    </div>
  )

  return (
    <FieldLayout
      label={label}
      optional={optional}
      htmlFor={field.name}
      help={help}
      errors={field.state.meta.errors}
      labelProps={labelProps}
      outerProps={outerProps}
    >
      {trailingControl ? (
        <div className="flex flex-row gap-2">
          {input}
          {trailingControl}
        </div>
      ) : (
        input
      )}
    </FieldLayout>
  )
}
