import { formatFormError } from "@/src/core/components/forms/formatFormError"
import type { FormApi } from "@/src/core/components/forms/types"
import { clsx } from "clsx"
import { ComponentPropsWithoutRef, forwardRef, PropsWithoutRef } from "react"

export interface LabeledTextFieldProps extends Omit<
  PropsWithoutRef<JSX.IntrinsicElements["input"]>,
  "form"
> {
  form: FormApi<Record<string, unknown>>
  name: string
  label: string
  help?: string
  type?: "text" | "password" | "email" | "number" | "tel" | "url" | "date" | "time"
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  optional?: boolean
  disabled?: boolean
  inlineLeadingAddon?: string
}

export const LabeledTextField = forwardRef<HTMLInputElement, LabeledTextFieldProps>(
  function LabeledTextField(
    {
      form,
      name,
      label,
      help,
      outerProps,
      labelProps,
      optional,
      disabled,
      inlineLeadingAddon,
      ...props
    },
    _ref,
  ) {
    return (
      <form.Field name={name}>
        {(field) => {
          const v = field.state.value
          const strVal =
            v === undefined || v === null ? "" : typeof v === "number" ? String(v) : String(v)
          const hasError = field.state.meta.errors.length > 0
          const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (props.type === "number" && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
              e.preventDefault()
            }
            props.onKeyDown?.(e)
          }
          return (
            <div {...outerProps}>
              <label
                {...labelProps}
                htmlFor={name}
                className="mb-1 block text-sm font-medium text-gray-700"
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
                  disabled={disabled || field.form.state.isSubmitting}
                  id={name}
                  {...props}
                  value={strVal}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const raw = e.target.value
                    if (props.type === "number") {
                      field.handleChange(raw === "" ? undefined : Number(raw))
                    } else {
                      field.handleChange(raw)
                    }
                  }}
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
              {hasError && (
                <div role="alert" className="mt-1 text-sm text-red-800">
                  {field.state.meta.errors.map((err) => formatFormError(err)).join(", ")}
                </div>
              )}
            </div>
          )
        }}
      </form.Field>
    )
  },
)
