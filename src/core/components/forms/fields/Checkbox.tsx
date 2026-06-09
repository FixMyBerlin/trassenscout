"use client"

import { FieldErrors } from "@/src/core/components/forms/FieldErrors"
import { useFieldContext } from "@/src/core/components/forms/hooks/formContext"
import {
  checkboxInputClassName,
  checkboxLabelClassName,
  checkboxRowClassName,
} from "@/src/core/components/forms/styles/checkboxFieldStyles"
import { clsx } from "clsx"
import { ComponentPropsWithoutRef, PropsWithoutRef } from "react"

export type CheckboxProps = {
  label: string | React.ReactNode
  help?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  readonly?: boolean
  disabled?: boolean
} & Omit<
  PropsWithoutRef<JSX.IntrinsicElements["input"]>,
  "type" | "checked" | "onChange" | "onBlur"
>

export function Checkbox({
  label,
  help,
  outerProps,
  labelProps,
  readonly,
  disabled,
  ...props
}: CheckboxProps) {
  const field = useFieldContext<boolean>()
  const hasError = field.state.meta.errors.length > 0

  return (
    <div {...outerProps} className={clsx(outerProps?.className, checkboxRowClassName)}>
      <div className="flex h-5 items-center">
        <input
          aria-describedby={`${field.name}-hint`}
          type="checkbox"
          id={field.name}
          disabled={disabled}
          readOnly={readonly}
          checked={Boolean(field.state.value)}
          {...props}
          onChange={(e) => field.handleChange(e.target.checked)}
          onBlur={field.handleBlur}
          className={checkboxInputClassName({ hasError, readonly, disabled })}
        />
      </div>
      <label
        {...labelProps}
        htmlFor={field.name}
        className={checkboxLabelClassName({ readonly, disabled })}
      >
        {label}
        {help && <div className="m-0 text-gray-500">{help}</div>}
        <FieldErrors errors={field.state.meta.errors} />
      </label>
    </div>
  )
}
