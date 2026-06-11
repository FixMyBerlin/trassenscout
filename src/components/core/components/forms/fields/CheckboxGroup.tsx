import { ComponentPropsWithoutRef } from "react"
import { twJoin } from "tailwind-merge"
import { FieldErrors } from "@/src/components/core/components/forms/FieldErrors"
import { useFieldContext } from "@/src/components/core/components/forms/hooks/formContext"
import { useFieldDisabled } from "@/src/components/core/components/forms/hooks/useFormHydrated"
import {
  checkboxInputClassName,
  checkboxLabelClassName,
  checkboxRowClassName,
} from "@/src/components/core/components/forms/styles/checkboxFieldStyles"

type CheckboxGroupItem = {
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
  const fieldDisabled = useFieldDisabled(disabled)
  const hasError = field.state.meta.errors.length > 0
  const values = Array.isArray(field.state.value) ? field.state.value.map(String) : []

  return (
    <div>
      {label && (
        <p className={classLabelOverwrite || "mb-4 block text-sm font-medium text-gray-700"}>
          {label} {optional && <> (optional)</>}
        </p>
      )}
      <div className={twJoin(classNameItemWrapper, "flex flex-col gap-3")}>
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
                  disabled={fieldDisabled}
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
