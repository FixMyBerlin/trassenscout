import { ErrorMessage } from "@hookform/error-message"
import clsx from "clsx"
import { ComponentPropsWithoutRef, forwardRef, PropsWithoutRef } from "react"
import { useFormContext } from "react-hook-form"

export interface LabeledSelectProps extends PropsWithoutRef<JSX.IntrinsicElements["select"]> {
  /** Select name. */
  name: string
  /** Options: [value, text] */
  options: [string, string][]
  /** Field label. */
  label: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  optional?: boolean
}

export const LabeledSelect = forwardRef<HTMLInputElement, LabeledSelectProps>(
  ({ name, options, label, outerProps, labelProps, optional, ...props }, ref) => {
    const {
      register,
      formState: { isSubmitting, errors },
    } = useFormContext()

    const hasError = Boolean(errors[name])

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
        <select
          disabled={isSubmitting}
          {...register(name)}
          id={name}
          {...props}
          className={clsx(
            "w-full rounded-md border bg-white py-2 px-3 shadow-sm focus:outline-none sm:text-sm",
            hasError
              ? "border-red-700 shadow-red-200 focus:border-red-800 focus:ring-red-800"
              : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          )}
        >
          {options.map(([value, text]) => (
            <option key={value} value={value}>
              {text}
            </option>
          ))}
        </select>

        <ErrorMessage
          render={({ message }) => (
            <div role="alert" className="mt-1 text-sm text-red-700">
              {message}
            </div>
          )}
          errors={errors}
          name={name}
        />
      </div>
    )
  }
)
