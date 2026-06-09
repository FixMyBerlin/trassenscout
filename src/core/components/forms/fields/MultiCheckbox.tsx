"use client"

import { useFieldContext } from "@/src/core/components/forms/hooks/formContext"
import {
  checkboxInputClassName,
  checkboxLabelClassName,
  checkboxRowClassName,
} from "@/src/core/components/forms/styles/checkboxFieldStyles"
import { clsx } from "clsx"
import { ComponentPropsWithoutRef, PropsWithoutRef } from "react"

export type MultiCheckboxProps = {
  value: string
  label: string | React.ReactNode
  help?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  readonly?: boolean
  disabled?: boolean
} & Omit<PropsWithoutRef<JSX.IntrinsicElements["input"]>, "type" | "checked" | "onChange">

/**
 * One option for a multi-select checkbox field (`string[]`).
 * Wrap with `form.AppField name={scope}` — use {@link CheckboxGroup} when options render together.
 */
export function MultiCheckbox({
  value,
  label,
  help,
  outerProps,
  labelProps,
  readonly,
  disabled,
  ...props
}: MultiCheckboxProps) {
  const field = useFieldContext<string[]>()
  const id = `${field.name}-${value}`
  const values = Array.isArray(field.state.value) ? field.state.value : []
  const hasError = field.state.meta.errors.length > 0
  const checked = values.includes(value)

  const toggle = (isChecked: boolean) => {
    const updated = isChecked ? [...values, value] : values.filter((v) => v !== value)
    field.handleChange(updated)
  }

  return (
    <div {...outerProps} className={clsx(outerProps?.className, checkboxRowClassName)}>
      <div className="flex h-5 items-center">
        <input
          aria-describedby={`${field.name}-hint`}
          type="checkbox"
          id={id}
          value={value}
          disabled={disabled}
          readOnly={readonly}
          checked={checked}
          {...props}
          onChange={(e) => toggle(e.target.checked)}
          onBlur={field.handleBlur}
          className={checkboxInputClassName({ hasError, readonly, disabled })}
        />
      </div>
      <label
        {...labelProps}
        htmlFor={id}
        className={checkboxLabelClassName({ readonly, disabled })}
      >
        {label}
        {help && <div className="m-0 text-gray-500">{help}</div>}
      </label>
    </div>
  )
}
