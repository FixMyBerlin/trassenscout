"use client"

import { FieldErrors } from "@/src/core/components/forms/FieldErrors"
import { useFieldContext } from "@/src/core/components/forms/hooks/formContext"
import { clsx } from "clsx"
import { ComponentPropsWithoutRef, PropsWithoutRef } from "react"

export type TextareaFieldProps = {
  label: string
  help?: string
  optional?: boolean
  disabled?: boolean
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
} & Omit<PropsWithoutRef<JSX.IntrinsicElements["textarea"]>, "value" | "onChange" | "onBlur">

export function TextareaField({
  label,
  help,
  optional,
  disabled,
  outerProps,
  labelProps,
  className: textareaClassName,
  ...props
}: TextareaFieldProps) {
  const field = useFieldContext<string | null>()
  const hasError = field.state.meta.errors.length > 0

  return (
    <div {...outerProps}>
      <label
        {...labelProps}
        htmlFor={field.name}
        className="mb-1 block text-sm font-medium text-gray-700"
      >
        {label}
        {optional && <> (optional)</>}
      </label>
      <textarea
        disabled={disabled}
        id={field.name}
        {...props}
        value={String(field.state.value ?? "")}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        className={clsx(
          textareaClassName,
          "mt-1 block w-full rounded-md shadow-xs sm:text-sm",
          hasError
            ? "border-red-800 shadow-red-200 focus:border-red-800 focus:ring-red-800"
            : props.readOnly || disabled
              ? "border-gray-200 bg-gray-100"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
        )}
      />
      {Boolean(help) && <p className="mt-2 text-sm text-gray-500">{help}</p>}
      <FieldErrors errors={field.state.meta.errors} />
    </div>
  )
}
