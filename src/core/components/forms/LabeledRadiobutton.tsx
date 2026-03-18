import { formatFormError } from "@/src/core/components/forms/formatFormError"
import type { FormApi } from "@/src/core/components/forms/types"
import { clsx } from "clsx"
import { ComponentPropsWithoutRef, forwardRef, PropsWithoutRef } from "react"

export interface LabeledRadiobuttonProps extends Omit<
  PropsWithoutRef<JSX.IntrinsicElements["input"]>,
  "form"
> {
  form: FormApi<Record<string, unknown>>
  scope: string
  value: string
  label: string | React.ReactNode
  help?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  readonly?: boolean
  disabled?: boolean
  _onChange?: (value: string) => void
  showScopeErrors?: boolean
}

export const LabeledRadiobutton = forwardRef<HTMLInputElement, LabeledRadiobuttonProps>(
  function LabeledRadiobutton(
    {
      form,
      scope,
      value,
      label,
      help,
      outerProps,
      labelProps,
      readonly,
      disabled,
      _onChange,
      showScopeErrors = true,
      ...props
    },
    _ref,
  ) {
    const key = [scope, value].join("-")
    return (
      <form.Field name={scope}>
        {(field) => {
          const cur = field.state.value
          const curStr = cur == null ? "" : String(cur)
          const hasError = showScopeErrors && field.state.meta.errors.length > 0
          return (
            <div
              {...outerProps}
              className={clsx(
                outerProps?.className,
                "flex break-inside-avoid items-center justify-start",
              )}
            >
              <div className="flex h-5 items-center">
                <input
                  type="radio"
                  disabled={disabled || field.form.state.isSubmitting}
                  readOnly={readonly}
                  checked={curStr === value}
                  onBlur={field.handleBlur}
                  onChange={() => {
                    field.handleChange(value === "" ? null : value)
                    _onChange?.(value)
                  }}
                  id={key}
                  className={clsx(
                    "h-4 w-4 cursor-pointer",
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
                htmlFor={key}
                className={clsx(
                  "block pl-3 text-sm font-medium whitespace-nowrap",
                  readonly || disabled
                    ? "text-gray-400"
                    : "cursor-pointer text-gray-700 hover:text-gray-900",
                )}
              >
                {label}
                {help && <div className="m-0 text-gray-500">{help}</div>}
                {hasError && (
                  <p role="alert" className="m-0 text-sm text-red-800">
                    {field.state.meta.errors.map((err) => formatFormError(err)).join(", ")}
                  </p>
                )}
              </label>
            </div>
          )
        }}
      </form.Field>
    )
  },
)
