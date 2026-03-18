import type { FormApi } from "@/src/core/components/forms/types"
import { formatFormError } from "@/src/core/components/forms/formatFormError"
import { clsx } from "clsx"
import { ComponentPropsWithoutRef, forwardRef, PropsWithoutRef } from "react"

export interface LabeledCheckboxProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  form: FormApi<Record<string, unknown>>
  scope: string
  value?: string
  label: string | React.ReactNode
  help?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  readonly?: boolean
  disabled?: boolean
  /** When false, scope-level errors are not shown (e.g. inside LabeledCheckboxGroup). */
  showScopeErrors?: boolean
}

export const LabeledCheckbox = forwardRef<HTMLInputElement, LabeledCheckboxProps>(
  function LabeledCheckbox(
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
      showScopeErrors = true,
      ...props
    },
    _ref,
  ) {
    const key = value != null ? [scope, value].join("-") : scope
    const isArrayMember = value != null && value !== "true"

    return (
      <form.Field name={scope}>
        {(field) => {
          const hasError = showScopeErrors && field.state.meta.errors.length > 0
          const isSubmitting = field.form.state.isSubmitting

          if (!isArrayMember) {
            const checked =
              value === "true"
                ? field.state.value === true || field.state.value === "true"
                : Boolean(field.state.value)
            return (
              <div
                {...outerProps}
                className={clsx(outerProps?.className, "flex break-inside-avoid items-start")}
              >
                <div className="flex h-5 items-center">
                  <input
                    aria-describedby={scope + "Hint"}
                    type="checkbox"
                    disabled={disabled || isSubmitting}
                    readOnly={readonly}
                    checked={checked}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    id={key}
                    {...props}
                    className={clsx(
                      "h-4 w-4 cursor-pointer rounded",
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
          }

          const arr = Array.isArray(field.state.value)
            ? (field.state.value as unknown[]).map(String)
            : []
          const memberChecked = arr.includes(value)

          return (
            <div
              {...outerProps}
              className={clsx(outerProps?.className, "flex break-inside-avoid items-start")}
            >
              <div className="flex h-5 items-center">
                <input
                  aria-describedby={scope + "Hint"}
                  type="checkbox"
                  disabled={disabled || isSubmitting}
                  readOnly={readonly}
                  checked={memberChecked}
                  onBlur={field.handleBlur}
                  onChange={() => {
                    if (memberChecked) {
                      field.handleChange(arr.filter((v) => v !== value) as never)
                    } else {
                      field.handleChange([...arr, value] as never)
                    }
                  }}
                  id={key}
                  {...props}
                  className={clsx(
                    "h-4 w-4 cursor-pointer rounded",
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
