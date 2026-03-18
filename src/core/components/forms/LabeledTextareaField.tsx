import { formatFormError } from "@/src/core/components/forms/formatFormError"
import type { FormApi } from "@/src/core/components/forms/types"
import { clsx } from "clsx"
import { ComponentPropsWithoutRef, forwardRef, PropsWithoutRef } from "react"

export interface LabeledTextareaProps extends Omit<
  PropsWithoutRef<JSX.IntrinsicElements["textarea"]>,
  "form"
> {
  form: FormApi<Record<string, unknown>>
  name: string
  label: string
  help?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  optional?: boolean
  disabled?: boolean
}

export const LabeledTextareaField = forwardRef<HTMLTextAreaElement, LabeledTextareaProps>(
  function LabeledTextareaField(
    {
      form,
      name,
      label,
      help,
      outerProps,
      labelProps,
      optional,
      disabled,
      className: textareaClasName,
      ...props
    },
    _ref,
  ) {
    return (
      <form.Field name={name}>
        {(field) => {
          const v = field.state.value
          const strVal = v == null ? "" : String(v)
          const hasError = field.state.meta.errors.length > 0
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
              <textarea
                disabled={disabled || field.form.state.isSubmitting}
                id={name}
                {...props}
                value={strVal}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className={clsx(
                  textareaClasName,
                  "mt-1 block w-full rounded-md shadow-xs sm:text-sm",
                  hasError
                    ? "border-red-800 shadow-red-200 focus:border-red-800 focus:ring-red-800"
                    : props.readOnly || disabled
                      ? "border-gray-200 bg-gray-100"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                )}
              />
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
