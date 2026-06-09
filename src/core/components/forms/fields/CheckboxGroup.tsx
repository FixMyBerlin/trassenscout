"use client"

import { FieldErrors } from "@/src/core/components/forms/FieldErrors"
import { useFieldContext } from "@/src/core/components/forms/hooks/formContext"
import {
  checkboxInputClassName,
  checkboxLabelClassName,
  checkboxRowClassName,
} from "@/src/core/components/forms/styles/checkboxFieldStyles"
import { clsx } from "clsx"
import { ComponentPropsWithoutRef } from "react"

export type CheckboxGroupItem = {
  value: string
  label: string | React.ReactNode
  help?: string
  labelProps?: ComponentPropsWithoutRef<"label">
}

export type CheckboxGroupProps = {
  label?: string
  optional?: boolean
  disabled?: boolean
  items: CheckboxGroupItem[]
  classLabelOverwrite?: string
  classNameItemWrapper?: string
}

export function CheckboxGroup({
  label,
  optional,
  disabled,
  items,
  classLabelOverwrite,
  classNameItemWrapper,
}: CheckboxGroupProps) {
  const field = useFieldContext<string[]>()
  const hasError = field.state.meta.errors.length > 0
  const values = Array.isArray(field.state.value) ? field.state.value : []

  return (
    <div>
      {label && (
        <p className={classLabelOverwrite || "mb-4 block text-sm font-medium text-gray-700"}>
          {label} {optional && <> (optional)</>}
        </p>
      )}
      <div className={clsx(classNameItemWrapper, "flex flex-col gap-3")}>
        {items.map((item) => {
          const id = `${field.name}-${item.value}`
          const checked = values.includes(item.value)

          return (
            <div key={item.value} className={checkboxRowClassName}>
              <div className="flex h-5 items-center">
                <input
                  aria-describedby={`${field.name}-hint`}
                  type="checkbox"
                  id={id}
                  value={item.value}
                  disabled={disabled}
                  checked={checked}
                  onChange={(e) => {
                    const updated = e.target.checked
                      ? [...values, item.value]
                      : values.filter((v) => v !== item.value)
                    field.handleChange(updated)
                  }}
                  onBlur={field.handleBlur}
                  className={checkboxInputClassName({ hasError, disabled })}
                />
              </div>
              <label
                {...item.labelProps}
                htmlFor={id}
                className={checkboxLabelClassName({ disabled })}
              >
                {item.label}
                {item.help && <div className="m-0 text-gray-500">{item.help}</div>}
              </label>
            </div>
          )
        })}
      </div>
      <FieldErrors errors={field.state.meta.errors} />
    </div>
  )
}
