"use client"

import { FieldErrors } from "@/src/core/components/forms/FieldErrors"
import { useFieldContext } from "@/src/core/components/forms/hooks/formContext"
import { clsx } from "clsx"
import { ComponentPropsWithoutRef, PropsWithoutRef } from "react"
import { twMerge } from "tailwind-merge"

export type TextFieldProps = {
  label: string
  help?: string
  optional?: boolean
  disabled?: boolean
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  inlineLeadingAddon?: string
} & Omit<PropsWithoutRef<JSX.IntrinsicElements["input"]>, "value" | "onChange" | "onBlur">

export function TextField({
  label,
  help,
  optional,
  disabled,
  outerProps,
  labelProps,
  inlineLeadingAddon,
  onKeyDown,
  ...props
}: TextFieldProps) {
  const field = useFieldContext<string>()
  const hasError = field.state.meta.errors.length > 0
  const { className: labelClassName, ...restLabelProps } = labelProps ?? {}

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (props.type === "number" && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault()
    }
    onKeyDown?.(e)
  }

  return (
    <div {...outerProps}>
      <label
        {...restLabelProps}
        htmlFor={field.name}
        className={twMerge("mb-1 block text-sm font-medium text-gray-700", labelClassName)}
      >
        {label}
        {optional && <> (optional)</>}
      </label>
      <div className="relative">
        {inlineLeadingAddon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 sm:text-sm">{inlineLeadingAddon}</span>
          </div>
        )}
        <input
          disabled={disabled}
          id={field.name}
          {...props}
          value={String(field.state.value ?? "")}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          onKeyDown={handleKeyDown}
          className={clsx(
            inlineLeadingAddon ? "pl-12" : "",
            "block w-full appearance-none rounded-md border border-gray-200 px-3 py-2 placeholder-gray-400 shadow-xs focus:outline-hidden sm:text-sm",
            hasError
              ? "border-red-800 shadow-red-200 focus:border-red-800 focus:ring-red-800"
              : props.readOnly || disabled
                ? "bg-gray-50 text-gray-500 ring-gray-200"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
          )}
        />
      </div>
      {Boolean(help) && <p className="mt-2 text-sm text-gray-500">{help}</p>}
      <FieldErrors errors={field.state.meta.errors} />
    </div>
  )
}
